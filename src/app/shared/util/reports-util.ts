import _ from 'lodash';
import {Injectable} from '@angular/core';
// import * as Validator from './report-builder-validator';
import {ReportAlertsConfig, ReportsSummaryConfig} from './report-alerts-config';

@Injectable()
export class ReportsUtil {

  public getReportFormData(reportTemplate, reportInstance) {

    const partner_type = _.isEmpty(reportInstance) ? '' : reportInstance.data.context.partner.type[0];

    const templateInfo = reportTemplate;

    // Dimension options
    let dimeData = templateInfo.report.dimensions[0].fieldSets[0].fields;

    let dimeValues = dimeData.filter((obj) => {

      return _.includes(obj.partnerType, partner_type.toLowerCase());
    });

    dimeValues = dimeValues.map((obj) => {
      return {
        label: obj.report_alias,
        value: obj.f7_name
      };
    });

    if(!_.isEmpty(reportInstance)) {

      // CUSTOM DIMENSION FIELD
      let  instanceCustomDime = reportInstance.data.report.dimensions[0].fieldSets[0].fields.filter((obj) => {

        return obj.isCustomField;

      });

      instanceCustomDime = instanceCustomDime.map((obj) => {

        const customField = 'Custom|' + obj.f7_name + '(' + obj.value +')';
        const customAlias = obj.f7_name + '(' + obj.value +')';

        obj.f7_name = customField;
        obj.report_alias =customAlias;
        return obj;
      });

      dimeData= dimeData.concat(instanceCustomDime);

      // CUSTOM ALIAS FIELD
      let  instanceAliasDime = reportInstance.data.report.dimensions[0].fieldSets[0].fields.filter((obj) => {
        return obj.isCustomAlias;
      });

      instanceAliasDime = instanceAliasDime.map((obj) => {
        obj.originalValue = obj.f7_name;
        obj.f7_name = _.now()  + '|' + obj.f7_name;
        return obj;
      });

      dimeData= dimeData.concat(instanceAliasDime);
    };

    // Partner Type Options
    const partnerType = templateInfo.context.partner.type;

    var partnerTypeLabels = {
      "PROV" : "Provider",
      "TPAS" : "3rd Party Ad Server",
      "VERI" :  "Verification" }

    const partnerProp = partnerType.map((obj) => {
      const _obj = {
        label: partnerTypeLabels[obj],
        value: obj
      };

      return _obj;
    });

    const mappingStatusProp = templateInfo.mappingOptions;

    // Filter Options
    const filterList = templateInfo.report.filterList[0].fieldSets[0].fields;

    let filterValues = filterList.filter((obj) => {

      return _.includes(obj.partnerType, partner_type.toLowerCase());
    });

    filterValues = filterValues.map((obj) => {
      return {
        label: obj.report_alias,
        value: obj.f7_name
      };
    });

    // metrics options

    let metData = templateInfo.report.metrics[0].fieldSets[0].fields;

    let metricsValues = metData.filter((obj) => {

      return _.includes(obj.partnerType, partner_type.toLowerCase());
    });

    metricsValues = metricsValues.map((obj) => {
      return {
        label: obj.report_alias,
        value: obj.f7_name
      };
    });

    if(!_.isEmpty(reportInstance)) {

      // DERIVED METRICS FIELD
      let  instanceDerivedMetrics = reportInstance.data.report.metrics[0].fieldSets[0].fields.filter((obj) => {
        return obj.isFuncExpr;
      });

      instanceDerivedMetrics = instanceDerivedMetrics.map((obj) => {
        const customField = 'Custom|' + obj.f7_name + '(' + obj.derivedField_func_expr +')';
        const customAlias = obj.f7_name + '(' + obj.derivedField_func_expr +')';
        obj.f7_name = customField;
        obj.report_alias =customAlias;
        return obj;
      });

      metData = metData.concat(instanceDerivedMetrics);

      // CUSTOM ALIAS FIELD
      let  instanceAliasMetrics = reportInstance.data.report.metrics[0].fieldSets[0].fields.filter((obj) => {
        return obj.isCustomAlias;
      });

      instanceAliasMetrics = instanceAliasMetrics.map((obj) => {
        obj.f7_name = _.now()  + '|' + obj.f7_name;
        return obj;
      });

      metData= metData.concat(instanceAliasMetrics);
    };

    const aggrData = templateInfo.report.period.aggregation;

    const aggrProp = aggrData.map((obj) => {

      const _obj = {
        label: obj.option,
        value: obj.option};

      return _obj;
    });

    const periodData = templateInfo.report.period.duration;

    const periodProp = periodData.map((obj) => {

      const _obj = {
        label: obj.option,
        value: obj.value};

      return _obj;
    });

    const frequencyData = templateInfo.report.delivery.frequency;

    const frequencyProp = frequencyData.map((obj) => {

      const _obj = {label: obj.option,
        value: obj.option};

      return _obj;
    });

    const filetypeData = templateInfo.report.delivery.extension;

    const filetypeProp = filetypeData.map((obj) => {

      const _obj = {label: obj.option,
        value: obj.option};

      return _obj;
    });

    const formRenderData: any = {};
    formRenderData.dimensions = dimeData;
    formRenderData.metrics = metData;
    formRenderData.aggr = aggrProp;
    formRenderData.period = periodProp;
    formRenderData.frequency = frequencyProp;
    formRenderData.fileType = filetypeProp;
    formRenderData.filterList = filterList;
    formRenderData.formRender = true;
    formRenderData.templateInfo = templateInfo;
    formRenderData.partnerType = partnerProp;
    formRenderData.mappingStatus  = mappingStatusProp;
    formRenderData.alertEnabled = templateInfo.alertEnabled;
    formRenderData.summaryEnabled = templateInfo.summaryEnabled;
    formRenderData.alert = {};
    formRenderData.alert.alertType = ReportAlertsConfig.alertType;
    formRenderData.alert.movingAveragePeriod = ReportAlertsConfig.movingAveragePeriod;
    formRenderData.alert.metrics = ReportAlertsConfig.metrics;
    formRenderData.alert.opr = ReportAlertsConfig.opr;
    formRenderData.summary = {};
    formRenderData.summary.aggregation = ReportsSummaryConfig.aggregations;
    return formRenderData;
  };

  public submitDataTransformation(formValues, reportInstance, reportInstanceExisting, reportTemplate) {
    var reportTemplateObj = _.cloneDeep(reportTemplate);
    const partnerTypeArr = [];
    if (formValues.filterList) {
      //Validator.validateSubFilter(formValues);  // TODO
    }
    delete reportInstance._id;
    reportInstance.report.concepts = [];
    reportInstance.report.graph = [];
    reportInstance.name = formValues.reportName.trim();

    // duration
    const duration = reportInstance.report.period.duration;

    const durationField = duration.filter((field1) =>
      field1.value === formValues.period
    );

    if (formValues.period === 25) {
      durationField[0].value = parseInt(formValues.noOfDays, 10);
    }

    durationField[0].start = formValues.startDate;
    durationField[0].end = formValues.endDate;

    reportInstance.report.period.duration = durationField;

    // aggregation
    const aggregation = reportInstance.report.period.aggregation;

    const aggregationField = aggregation.filter((field1) =>

      field1.option === formValues.aggregation
    );

    reportInstance.report.period.aggregation = aggregationField;

    // FILTERS
    const subFilters = [];

    if (formValues.mappingStatus !== 'Unmapped') {
      _.forEach(formValues, (value, key) => {
        if (key.startsWith('subFilter:')) {
          subFilters.push(key);
        }
      });
    }

    subFilters.forEach((subFilKey) => {
      const existingFilter = formValues.filterList.split(',').map((obj) => {
        return obj;
      });

      if (_.includes(existingFilter, subFilKey.split(':')[1])) {
        const splitData = subFilKey.split(':');
        const f7Name = splitData[1];
        const reportAlias = splitData[2];
        const filterVal = formValues[subFilKey];
        const filterValArr = filterVal.split('|');
        const filterRec = {
          f7_name: '',
          reportAlias: '',
          value: []
        };

        filterRec.f7_name = f7Name;
        filterRec.reportAlias = reportAlias;
        filterRec.value = _.map(filterValArr, (v) => v);
        reportInstance.report.filters.push(filterRec);
      }
    });


    const filters = reportInstance.report.filterList[0].fieldSets[0].fields;
    const filterFields = filters.filter((field1) => {
      if (formValues.filterList) {
        const val3 = _.size(formValues.filterList) > 0 ? formValues.filterList.split(',') : [];
        return val3.indexOf(field1.f7_name) > -1;
      }
    });

    filterFields.forEach( filterObj => {
      delete filterObj.filterConfig;
      delete filterObj.selectedItems;
    });

    reportInstance.report.filterList[0].fieldSets[0].fields = filterFields;

    // const selectedDime = formValues.dimensions.map((obj) => {
    //
    //  return obj.value;
    // });

    let selectedDime = formValues.dimensions.map((obj) => {

      return obj.value;
    });


    selectedDime = selectedDime.filter((obj) => {
      return obj !== 'A1_All';
    });
    // If it is a alert report, make date as mandatory dimensions
    /*if(formValues["isAlert"] === true) {
        if(!selectedDime.includes('date'))
        {
          selectedDime.push('date');
        }
    }; */


    // formValues.dimensions = selectedDime.join(",");

    // dimensions
    const dimensions = reportInstance.report.dimensions[0].fieldSets[0].fields;


    const sortedArr = [];
    selectedDime.forEach((field1) => {
      let aliasCheck = this.isAliasField(field1);
      let field1Value = this.removeAlias(field1);
      _.forEach(dimensions, (value) => {

        if (value.f7_name == field1Value) {
          if (aliasCheck) {
            value.isCustomAlias = true;
            let findAlias = _.find(formValues.dimensions, {value: field1});
            if (findAlias) {
              value.report_alias = findAlias.label;
            }
          }
          sortedArr.push(value);
        }

      });

    });


    reportInstance.report.dimensions[0].fieldSets[0].fields = sortedArr;


    // ADD CUSTOM dimensions


    const customDimensionsField = selectedDime.filter((field1) => {
      return field1.startsWith('Custom|');
    });

    customDimensionsField.forEach((field1) => {

      let customField = field1.split('Custom|')[1];

      let fieldName = customField.split('(')[0];
      let fieldVal = customField.split('(')[1];
      let fieldVal2 = fieldVal.substring(0, fieldVal.length - 1);
      ;

      var customDimension = dimensions[0];
      customDimension['f7_name'] = fieldName;
      customDimension['report_alias'] = fieldName;
      customDimension['isStaticField'] = true;
      customDimension['isCustomField'] = true;
      customDimension['value'] = fieldVal2;

      const custClone = _.clone(customDimension);
      reportInstance.report.dimensions[0].fieldSets[0].fields.push(custClone);
    });


    // const selectedMetrics = formValues.metrics.map((obj) => {
    //
    //  return obj.value;
    // });

    let selectedMetrics = formValues.metrics.map((obj) => {

      return obj.value;
    });


    selectedMetrics = selectedMetrics.filter((obj) => {

      return obj !== 'A1_All';
    });

    const selectedMetrices = selectedMetrics.join(',');
    // metrics
    const metrics = reportInstance.report.metrics[0].fieldSets[0].fields;

    const metricsField = selectedMetrices.split(',').map((field1) => {
      const sortedArr = [];
      let aliasCheck = this.isAliasField(field1);
      let field1Value = this.removeAlias(field1);
      _.forEach(metrics, (value) => {
        if (value.f7_name == field1Value) {
          if (aliasCheck) {
            value.isCustomAlias = true;
            let findAlias = _.find(formValues.metrics, {value: field1});
            if (findAlias) {
              value.report_alias = findAlias.label;
            }
          }
          sortedArr.push(value);
        }


      });

      return sortedArr;
    });

    const finalSortedArrMetrics = metricsField.map((obj) => {
      return obj[0];
    });

    reportInstance.report.metrics[0].fieldSets[0].fields = finalSortedArrMetrics;

    // Derived Metrics
    const customDerivedMetricsField = selectedMetrics.filter((field1) => {
      return field1.startsWith('Custom|');
    });

    customDerivedMetricsField.forEach((field1) => {

      let customField = field1.split('Custom|')[1];
      let customField2 = [customField.split('(', 1).toString(), customField.split('(').slice(1).join('(')];

      let fieldName = customField2[0];
      let fieldVal = customField2[1];
      let fieldVal2 = fieldVal.substring(0, fieldVal.length - 1);
      ;

      console.log('fieldName', fieldName);
      console.log('fieldVal2', fieldVal2);


      var derivedMetrics = metrics[0];
      derivedMetrics['f7_name'] = fieldName;
      derivedMetrics['report_alias'] = fieldName;
      derivedMetrics['alias'] = fieldName;
      derivedMetrics['selected'] = false;
      derivedMetrics['isDerivedField'] = true;
      derivedMetrics['isFuncExpr'] = true;
      derivedMetrics['derivedField_func_expr'] = fieldVal2;
      derivedMetrics['derivedField_func_param'] = [];
      derivedMetrics['type'] = 'Number';

      var derivedField_func_param = [];

      var re = /[+\-\*\/\(\)]/g;
      var a = fieldVal2.replace(re, '|');
      var dependentMetrics = a.split('|').filter(
        (val) => {
          return val != null && val.trim().length > 0 && isNaN(val);
        });

      console.log('dependentMetrics=', dependentMetrics);

      var arr = reportTemplateObj.report.metrics[0].fieldSets[0].fields.filter((obj) => {
        if (obj && dependentMetrics.includes(obj.report_alias)) {
          return true;
        }

      });

      derivedField_func_param = derivedField_func_param.concat(arr);

      console.log('derivedField_func_param=', derivedField_func_param);

      derivedMetrics['derivedField_func_param'] = derivedField_func_param;

      const custClone = _.clone(derivedMetrics);

      var arr2 = reportInstance.report.metrics[0].fieldSets[0].fields.filter((obj) => {
        if (obj && (obj.report_alias === custClone.report_alias)) {
          return true;
        }

      });

      if (arr2.length === 0) {
        reportInstance.report.metrics[0].fieldSets[0].fields.push(custClone);
      }
    });

    // oneTimeRun
    if (formValues.oneTimeRun === 'yes') {
      reportInstance.report.delivery.oneTimeRun = true;
    } else {
      reportInstance.report.delivery.oneTimeRun = false;
    }

    // reportActive
    if (formValues.reportActive === 'yes') {
      reportInstance.report.delivery.active = true;
    } else {
      reportInstance.report.delivery.active = false;
    }

    // reportPublic
    if (formValues.reportPublic === 'yes') {
      reportInstance.report.delivery.public = true;
    } else {
      reportInstance.report.delivery.public = false;
    }

    partnerTypeArr.push(formValues.partnerType);
    reportInstance.mappingStatus = formValues.mappingStatus;
    reportInstance.context.partner.type = partnerTypeArr;
    reportInstance.report.delivery.lastRunTime = formValues.lastRunTime;
    reportInstance.report.delivery.lastRunResultId = formValues.lastRunResultId;
    reportInstance.report.delivery.lastRunStatus = formValues.lastRunStatus;
    reportInstance.report.delivery.schedule.end_date = formValues.freqEndDate;
    reportInstance.report.delivery.schedule.start_date = formValues.freqStartDate;
    reportInstance.report.delivery.schedule.runOnce = formValues.runOnce;
    // frequency
    const frequency = reportInstance.report.delivery.frequency;
    const frequencyField = frequency.filter(
      (field1) => field1.option === formValues.frequency);
    const values = [];
    const freqOption = !_.isUndefined(frequencyField[0])
      ? frequencyField[0].option : [];

    if (freqOption === 'Weekly') {
      if (formValues.frequency_week_Mon) {
        values.push('Mon');
      }
      if (formValues.frequency_week_Tue) {
        values.push('Tue');
      }
      if (formValues.frequency_week_Wed) {
        values.push('Wed');
      }
      if (formValues.frequency_week_Thu) {
        values.push('Thu');
      }
      if (formValues.frequency_week_Fri) {
        values.push('Fri');
      }
      if (formValues.frequency_week_Sat) {
        values.push('Sat');
      }
      if (formValues.frequency_week_Sun) {
        values.push('Sun');
      }
    } else if (freqOption === 'Monthly') {

      values.push(formValues.dayOfMonth);

    } else if (freqOption === 'Quarterly') {

      //values.push(`${formValues.monthOfQuarter}:${formValues.dayOfMonth}`); //TODO
    }
    if (!_.isUndefined(frequencyField[0])) {
      frequencyField[0].values = values;
    }

    reportInstance.report.delivery.frequency = frequencyField;
    reportInstance.report.delivery.runTime = formValues.runTime;
    reportInstance.report.delivery.email = formValues.email;
    if (formValues['hasEmail'] === true) {
      reportInstance.report.delivery.emailEnabled = true;
    } else {
      reportInstance.report.delivery.emailEnabled = false;
    }

    reportInstance.report.delivery.filename = formValues.fileName.trim();

    const extension = reportInstance.report.delivery.extension;

    const extensionField = extension.filter(
      (field1) => field1.option === formValues.fileType);

    reportInstance.report.delivery.type = formValues.fileType;

    reportInstance.report.delivery.extension = extensionField;

    if (formValues.hasFtp === true) {
      reportInstance.report.delivery.ftp.mode = 'active';
      reportInstance.report.delivery.ftp.enabled = true;
      reportInstance.report.delivery.ftpEnabled = true;
    } else {
      reportInstance.report.delivery.ftp.mode = 'passive';
      reportInstance.report.delivery.ftp.enabled = false;
    }
    reportInstance.report.delivery.ftp.host = _.isEmpty(formValues.ftpHost)
      ? ''
      : formValues.ftpHost;
    reportInstance.report.delivery.ftp.user = _.isEmpty(formValues.ftpUser)
      ? ''
      : formValues.ftpUser;
    reportInstance.report.delivery.ftp.password = _.isEmpty(formValues.ftpPwd)
      ? ''
      : formValues.ftpPwd;
    reportInstance.report.delivery.ftp.directory = _.isEmpty(formValues.ftpDir)
      ? ''
      : formValues.ftpDir;
    reportInstance.report.delivery.ftp.port = _.isEmpty(formValues.ftpPort)
      ? '0'
      : formValues.ftpPort;
    if (formValues.hasS3 === true) {
      reportInstance.report.delivery.s3Enabled = true;
      reportInstance.report.delivery.s3.enabled = true;
    }
    reportInstance.report.delivery.s3.bucket = _.isEmpty(formValues.s3Bucket)
      ? ''
      : formValues.s3Bucket;
    reportInstance.report.delivery.s3.accessKeyId = _.isEmpty(formValues.s3AccessKeyID)
      ? ''
      : formValues.s3AccessKeyID;
    reportInstance.report.delivery.s3.secretAccessKey = _.isEmpty(formValues.s3SecretAccessKey)
      ? ''
      : formValues.s3SecretAccessKey;

    // Filtering staticDimesion array by comapring partnerType Value
    reportInstance.report.staticDimensions =
      reportInstance.report.staticDimensions.filter((obj) => {

        return _.includes(obj.partnerType, formValues.partnerType.toLowerCase());
      });

    var alert = {};
    alert['alertType'] = formValues['alertType'];
    alert['alertMetric'] = formValues['alertMetric'];
    alert['alertopr'] = formValues['alertopr'];
    alert['generateReport'] = formValues['generateReport'];

    if (formValues['alertType'] === 'Threshold') {
      alert['alertThreshold1'] = formValues['alertThreshold1'];
      alert['alertThreshold2'] = formValues['alertThreshold2'];
    }
    else {
      alert['alertThreshold1'] = '';
      alert['alertThreshold2'] = '';
      alert['alertMovingAvgPeriod'] = formValues['alertMovingAvgPeriod'];
    }
    if (formValues['isAlert'] === true) {
      alert['enabled'] = true;

      reportInstance.report.delivery.emailEnabled = true;
      //reportInstance.showAlertNotify = true;
    }
    else {
      // reportInstance.showAlertNotify = false;
      alert['enabled'] = false;
    }

    var summary = {};
    var summaryFields = [];
    if (formValues['isSummary'] === true) {
      console.clear();
      _.forEach(formValues, (value, key) => {
        var index = Number(key.slice(-1));
        if (key.startsWith('summaryMetric')) {

          var summaryObj = {};
          summaryObj['report_alias'] = formValues[key];

          // var index = key.slice(-1);

          console.log(formValues['isSummaryRowCheck-' + index], 'Summary row group');
          if (_.isUndefined(formValues['isSummaryRowCheck-' + index])) {
            summaryObj['aggregationType'] = formValues['summaryAggregation-' + index];
            if (!_.isEmpty(formValues[key])) {

              formValues[key] = this.removeAlias(formValues[key]);
              var selectionsMetric = reportInstance.report.metrics[0].fieldSets[0].fields.find((obj) => {
                if (obj) {
                  return obj.f7_name === formValues[key];
                }
              });
              if (!_.isUndefined(selectionsMetric)) {
                summaryObj['report_alias'] = selectionsMetric['report_alias'];
              }

            }

            summaryFields.push(summaryObj);
          } else {
            formValues = _.omit(formValues, 'summaryAggregation-' + index);
            formValues = _.omit(formValues, 'summaryMetric-' + index);
          }
        }
      });
    }


    if (formValues['isSummary'] === true) {
      summary['enabled'] = true;
    }
    else {
      // reportInstance.showAlertNotify = false;
      summary['enabled'] = false;
    }

    summary['fields'] = summaryFields;

    // Alert version update

    if (alert['enabled'] === true) {
      if (reportInstanceExisting) {
        if (reportInstanceExisting.report.alert[0] && reportInstanceExisting.report.alert[0].version) {

          if (!this.checkAlertEqual(reportInstanceExisting.report.alert[0], alert)) {
            alert['version'] = parseInt(reportInstanceExisting.report.alert[0].version, 10) + 1;
          }
          else {
            alert['version'] = parseInt(reportInstanceExisting.report.alert[0].version, 10);
          }
        }
        else {
          alert['version'] = 1;
        }
      }
      else {
        alert['version'] = 1;
      }
    }


    reportInstance.report.metrics[0].fieldSets[0].fields = reportInstance.report.metrics[0].fieldSets[0].fields.filter(function (element) {
      return element !== undefined;
    });
    // Add alias name to alert

    if (!_.isEmpty(alert['alertMetric'])) {
      alert['alertMetric'] = this.removeAlias(alert['alertMetric']);

      var selectionsMetric = reportInstance.report.metrics[0].fieldSets[0].fields.find((obj) => {
        return obj.f7_name === alert['alertMetric'];
      });
      if (!_.isUndefined(selectionsMetric)) {
        alert['report_alias'] = selectionsMetric['report_alias'];
      }
    }
    if (formValues.isAlert === true) {
      reportInstance.report.alert.push(alert);
    } else {
      //reportInstance.report.alert.push({});
    }

    if (formValues.isSummary === true) {
      reportInstance.report.summary = summary;
    } else {
      //reportInstance.report.alert.push({});
    }
    // console.log('reportInstancefinal');
    // console.log(JSON.stringify(reportInstance));

    return reportInstance;
  };

  private checkAlertEqual(obj1, obj2) {
    if ((obj1['alertType'] === obj2['alertType']) && (obj1['alertMetric'] === obj2['alertMetric'])
      && (obj1['alertMovingAvgPeriod'] === obj2['alertMovingAvgPeriod']) && (obj1['alertopr'] === obj2['alertopr'])
      && (obj1['alertThreshold1'] === obj2['alertThreshold1']) && (obj1['alertThreshold2'] === obj2['alertThreshold2'])) {

      return true;
    }

    return false;
  };

  private removeAlias(key) {
    return _.last(key.split(/[0-9]\|+/));
  }

  private isAliasField(key) {
    let splitArray = key.split(/[0-9]\|+/);
    return splitArray.length > 1 ? true : false;
  }

}
