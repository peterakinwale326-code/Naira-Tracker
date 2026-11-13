"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsSourcesService = void 0;
const common_1 = require("@nestjs/common");
const NBS_CPI_CATALOG = 'https://microdata.nigerianstat.gov.ng/index.php/catalog/154/related-materials';
const UN_MBS_ENDPOINT = 'https://unstats.un.org/unsd/mbs/api/wsMbsServices.asmx';
const WORLD_BANK_ENDPOINT = 'https://api.worldbank.org/v2';
let StatisticsSourcesService = class StatisticsSourcesService {
    constructor() {
        this.cache = new Map();
    }
    async cached(key, loader, ttlMs = 6 * 60 * 60 * 1000) {
        const hit = this.cache.get(key);
        if (hit && hit.expiresAt > Date.now())
            return hit.value;
        const value = await loader();
        this.cache.set(key, { expiresAt: Date.now() + ttlMs, value });
        return value;
    }
    async getText(url, init) {
        let response;
        try {
            response = await fetch(url, { ...init, signal: AbortSignal.timeout(20000) });
        }
        catch (error) {
            if (error instanceof DOMException && error.name === 'TimeoutError') {
                throw new common_1.ServiceUnavailableException('Statistics provider request timed out.');
            }
            if (error instanceof TypeError) {
                throw new common_1.ServiceUnavailableException('Statistics provider could not be reached.');
            }
            throw error;
        }
        if (!response.ok)
            throw new common_1.ServiceUnavailableException(`Statistics provider returned HTTP ${response.status}`);
        try {
            return await response.text();
        }
        catch (error) {
            if (error instanceof DOMException && error.name === 'TimeoutError') {
                throw new common_1.ServiceUnavailableException('Statistics provider request timed out.');
            }
            if (error instanceof TypeError) {
                throw new common_1.ServiceUnavailableException('Statistics provider response could not be read.');
            }
            throw error;
        }
    }
    async getNbsCpiReleases() {
        return this.cached('nbs-cpi-releases', async () => {
            const html = await this.getText(NBS_CPI_CATALOG);
            const releases = [];
            const linkPattern = /<a\b[^>]*href=["']([^"']*\/catalog\/154\/download\/\d+[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
            let match;
            while ((match = linkPattern.exec(html)) && releases.length < 36) {
                const title = match[2].replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
                const href = match[1].startsWith('http') ? match[1] : new URL(match[1], NBS_CPI_CATALOG).toString();
                if (/\.zip|download/i.test(title + href))
                    releases.push({ title: title || 'NBS CPI release download', downloadUrl: href });
            }
            return {
                source: 'National Bureau of Statistics Nigeria',
                dataset: 'Consumer Price Index and Inflation',
                catalogUrl: NBS_CPI_CATALOG,
                retrievedAt: new Date().toISOString(),
                releases,
                note: 'Official NBS release files are linked here. Values must be read from the accompanying workbook/report; this catalogue response is release metadata, not a substitute for CPI observations.',
            };
        });
    }
    async getWorldBankIndicator(indicator, from = '2000', to = String(new Date().getFullYear())) {
        const allowed = new Set(['FP.CPI.TOTL.ZG', 'SL.UEM.TOTL.ZS', 'NY.GDP.MKTP.KD.ZG', 'NY.GDP.PCAP.CD', 'SP.POP.TOTL']);
        if (!allowed.has(indicator))
            throw new common_1.ServiceUnavailableException('Unsupported World Bank indicator.');
        const start = Math.max(1960, Number(from) || 2000);
        const end = Math.min(new Date().getFullYear(), Number(to) || new Date().getFullYear());
        if (start > end)
            throw new common_1.ServiceUnavailableException('Invalid World Bank year range.');
        const url = `${WORLD_BANK_ENDPOINT}/country/NGA/indicator/${encodeURIComponent(indicator)}?format=json&per_page=100&date=${start}:${end}`;
        return this.cached('wb:' + indicator + ':' + start + ':' + end, async () => {
            const payload = await this.getText(url);
            const parsed = JSON.parse(payload);
            if (!Array.isArray(parsed) || !Array.isArray(parsed[1])) {
                throw new common_1.ServiceUnavailableException('World Bank returned no indicator observations.');
            }
            return {
                source: 'World Bank',
                sourceUrl: url,
                indicator: parsed[1][0]?.indicator || { id: indicator, value: indicator },
                country: 'Nigeria',
                frequency: 'annual',
                retrievedAt: new Date().toISOString(),
                observations: parsed[1].filter((row) => row.value !== null).map((row) => ({
                    year: Number(row.date), value: row.value, unit: row.unit || null,
                    observationStatus: row.obs_status || null,
                })),
            };
        });
    }
    async getUnMonthlyCpi(fromYear = String(new Date().getFullYear() - 10), toYear = String(new Date().getFullYear())) {
        const start = Math.max(1990, Number(fromYear) || new Date().getFullYear() - 10);
        const end = Math.min(new Date().getFullYear(), Number(toYear) || new Date().getFullYear());
        if (start > end)
            throw new common_1.ServiceUnavailableException('Invalid UN MBS year range.');
        return this.cached('un-mbs-cpi:' + start + ':' + end, async () => {
            const body = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body><GetDataSeriesXML xmlns="http://unstats.un.org/unsd/mbs">
    <sid>5001</sid><cid>566</cid><yearfrom>${start}</yearfrom><yearto>${end}</yearto><p>M</p>
  </GetDataSeriesXML></soap:Body>
</soap:Envelope>`;
            const xml = await this.getText(UN_MBS_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: '"http://unstats.un.org/unsd/mbs/GetDataSeriesXML"' },
                body,
            });
            const escapedResult = xml.match(/<GetDataSeriesXMLResult>([\s\S]*?)<\/GetDataSeriesXMLResult>/i)?.[1] || '';
            const dataXml = escapedResult
                .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
                .replace(/&apos;/g, "'").replace(/&amp;/g, '&');
            const observations = [];
            const monthCodes = { M1: 1, M2: 2, M3: 3, M4: 4, M5: 5, M6: 6, M7: 7, M8: 8, M9: 9, MA: 10, MB: 11, MC: 12 };
            const readTag = (block, name) => {
                const match = block.match(new RegExp('<(?:[\\w.-]+:)?' + name + '(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[\\w.-]+:)?' + name + '>', 'i'));
                return match ? match[1].replace(/<[^>]+>/g, '').trim() : '';
            };
            const seriesBlocks = dataXml.match(/<(?:[\w.-]+:)?MbsDataSeries(?:\s[^>]*)?>[\s\S]*?<\/(?:[\w.-]+:)?MbsDataSeries>/gi) || [];
            for (const block of seriesBlocks) {
                const year = Number(readTag(block, 'PeriodYr'));
                const code = readTag(block, 'DateCode').toUpperCase();
                const month = monthCodes[code] || 0;
                const value = Number(readTag(block, 'Data').replace(/,/g, ''));
                const indexBase = readTag(block, 'Measure') || 'UN MBS index base not specified';
                const footnoteRefs = readTag(block, 'FootnoteRef').split('/').filter(Boolean);
                if (Number.isInteger(year) && year >= start && year <= end &&
                    Number.isInteger(month) && month >= 1 && month <= 12 &&
                    Number.isFinite(value) && value > 0) {
                    observations.push({
                        period: year + '-' + String(month).padStart(2, '0'),
                        year,
                        month,
                        cpiIndex: value,
                        source: 'United Nations Statistics Division – Monthly Bulletin of Statistics',
                        indexBase,
                        footnoteRefs,
                    });
                }
            }
            const footnotes = (dataXml.match(/<(?:[\w.-]+:)?MbsFootnotes(?:\s[^>]*)?>[\s\S]*?<\/(?:[\w.-]+:)?MbsFootnotes>/gi) || [])
                .map((block) => ({
                code: readTag(block, 'FNoteCode'),
                text: readTag(block, 'FNoteText'),
            }))
                .filter((item) => item.code && item.text);
            if (!observations.length) {
                throw new common_1.ServiceUnavailableException('UN MBS returned no parseable MbsDataSeries observations for the requested period.');
            }
            observations.sort((a, b) => a.period.localeCompare(b.period));
            const indexBases = [...new Set(observations.map((item) => item.indexBase))];
            return {
                source: 'United Nations Statistics Division – Monthly Bulletin of Statistics',
                sourceUrl: 'https://unstats.un.org/unsd/mbs/app/DataView.aspx?cid=566&p=A&tid=6&yearfrom=1997&yearto=2099',
                seriesCode: '5001',
                countryCode: '566',
                indexBase: indexBases.length === 1 ? indexBases[0] : 'Multiple reference bases; inspect each observation',
                fromYear: start,
                toYear: end,
                retrievedAt: new Date().toISOString(),
                observations,
                footnotes,
                dataXml,
                note: 'UN CPI is a separate reference series. Each observation retains its published index base and footnote references. Do not merge these index levels with NBS observations without checking the reference base and marked breaks in series.',
            };
        }, 24 * 60 * 60 * 1000);
    }
    async getSourceDirectory() {
        return {
            primary: {
                name: 'National Bureau of Statistics Nigeria',
                role: 'Official national CPI publisher and source for monthly headline, food and core inflation.',
                url: NBS_CPI_CATALOG,
                access: 'Public release downloads; no API key',
            },
            secondary: [
                { name: 'World Bank Indicators API', role: 'Annual macroeconomic context and comparison series', url: 'https://api.worldbank.org/v2', access: 'Public; no API key' },
                { name: 'UN Statistics Division MBS', role: 'Independent monthly CPI index reference', url: 'https://unstats.un.org/unsd/mbs/api/wsMbsServices.asmx', access: 'Public SOAP service; no API key' },
            ],
            methodology: 'Do not combine index levels across different base years. Keep publisher, frequency, units, reference period, publication date and footnotes attached to every observation.',
        };
    }
};
exports.StatisticsSourcesService = StatisticsSourcesService;
exports.StatisticsSourcesService = StatisticsSourcesService = __decorate([
    (0, common_1.Injectable)()
], StatisticsSourcesService);
//# sourceMappingURL=statistics-sources.service.js.map