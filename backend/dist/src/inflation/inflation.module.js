"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InflationModule = void 0;
const common_1 = require("@nestjs/common");
const inflation_controller_1 = require("./inflation.controller");
const inflation_service_1 = require("./inflation.service");
const statistics_sources_controller_1 = require("./statistics-sources.controller");
const statistics_sources_service_1 = require("./statistics-sources.service");
let InflationModule = class InflationModule {
};
exports.InflationModule = InflationModule;
exports.InflationModule = InflationModule = __decorate([
    (0, common_1.Module)({
        controllers: [inflation_controller_1.InflationController, statistics_sources_controller_1.StatisticsSourcesController],
        providers: [inflation_service_1.InflationService, statistics_sources_service_1.StatisticsSourcesService],
        exports: [inflation_service_1.InflationService, statistics_sources_service_1.StatisticsSourcesService],
    })
], InflationModule);
//# sourceMappingURL=inflation.module.js.map