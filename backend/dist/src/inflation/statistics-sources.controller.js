"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsSourcesController = void 0;
const common_1 = require("@nestjs/common");
const statistics_sources_service_1 = require("./statistics-sources.service");
let StatisticsSourcesController = class StatisticsSourcesController {
    constructor(sources) {
        this.sources = sources;
    }
    getSources() {
        return this.sources.getSourceDirectory();
    }
    getNbsReleases() {
        return this.sources.getNbsCpiReleases();
    }
    getWorldBank(indicator = 'FP.CPI.TOTL.ZG', from, to) {
        return this.sources.getWorldBankIndicator(indicator, from, to);
    }
    getUnCpi(from, to) {
        return this.sources.getUnMonthlyCpi(from, to);
    }
};
exports.StatisticsSourcesController = StatisticsSourcesController;
__decorate([
    (0, common_1.Get)('sources'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticsSourcesController.prototype, "getSources", null);
__decorate([
    (0, common_1.Get)('nbs/cpi/releases'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticsSourcesController.prototype, "getNbsReleases", null);
__decorate([
    (0, common_1.Get)('world-bank'),
    __param(0, (0, common_1.Query)('indicator')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], StatisticsSourcesController.prototype, "getWorldBank", null);
__decorate([
    (0, common_1.Get)('un/cpi'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StatisticsSourcesController.prototype, "getUnCpi", null);
exports.StatisticsSourcesController = StatisticsSourcesController = __decorate([
    (0, common_1.Controller)('api/v1/statistics'),
    __metadata("design:paramtypes", [statistics_sources_service_1.StatisticsSourcesService])
], StatisticsSourcesController);
//# sourceMappingURL=statistics-sources.controller.js.map