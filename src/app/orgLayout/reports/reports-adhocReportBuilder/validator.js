import _ from 'lodash';
// import { Injectable } from '@angular/core';
import moment from 'moment';
// @Injectable()
// export class Validator {
// }

export const checkEmailsCommaDelim = function checkEmailsCommaDelim(emails) {

if (emails.trim().length < 1) {
  return false;
}

const re = /^([\w-]+(?:\.[\w-+]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

  const emailsArr = emails.split(',');

  for (let i = 0; i < emailsArr.length; i += 1) {
      if (!re.test(emailsArr[i].trim())) {
        return false;
      }
  }

  return true;
};


export const checkFileNameDelim = function checkFileNameDelim(fileName) {

const regexp = /^[a-zA-Z0-9-_]+$/;

if (!regexp.test(fileName.trim())) {
  return false;
}

return true;

};

export const checkEmptyValue = function checkEmptyValue(fileName) {
  if(!_.isUndefined(fileName)) {
    return fileName.replace(/^\s+|\s+$/gm,'').length == 0;
  }
};


export const validateSubFilter = function validateSubFilter(formProps) {

 const subFilterArr = [];
 const filteredVal = _.filter(formProps, (value, key) => {
   if (key.startsWith("subFilter")) {
     subFilterArr.push(key);

     return value;
   }
 });

 const trimmed = formProps.filterList.replace(/(^\s*,)|(,\s*$)/g, '');

 const matchedVal = _.filter(subFilterArr, (value) => {
   return _.includes(trimmed.split(','), value.split(':')[1]);
 });

 if (formProps.filterList && trimmed.split(',').length > matchedVal.length) {
   return false;
}

    var noErr = true;
    var result = _.filter(formProps, function(value, key) {

     if (key.startsWith("subFilter")) {
       if(_.includes(matchedVal, key)) {
         if (_.isEmpty(formProps[key])) {
           noErr = false;
         }
       }
     }
   });

   return noErr;
 };

export const checkNameDelim = function checkNameDelim(fileName) {
const regexp = /^[a-zA-Z0-9-_]+( [a-zA-Z0-9-_]+)*$/;
//const properSpaceCheck = fileName.trim().split('  ').length > 2;
const properSpaceCheck = _.includes(fileName.split(''), '');


if (!regexp.test(fileName.trim())) {
  return false;
} else if (properSpaceCheck) {
  return false;
}

return true;

};

export const validate = function validate(formProps) {
  const errors = {};

  if (!formProps.reportName) {
    errors.reportName = 'Please enter report name';
  } else if (!checkNameDelim(formProps.reportName)) {
      errors.reportName = `Please correct report name.
      Only alphanumeric, dash, underscore, single space
      characters are allowed.`;
  }

  if (_.isEmpty(formProps.dimensions) || !formProps.dimensions) {
    errors.dimensions = 'Please select dimensions';
  }

  if (!formProps.partnerType) {
    errors.partnerType = 'Please select Partner Type';
  }

  if (_.isEmpty(formProps.metrics) || !formProps.metrics) {
    errors.metrics = 'Please select metrics';
  }


  if (!formProps.aggregation) {
    errors.aggregation = 'Please select aggregation';
  }

  if (!formProps.period) {
    errors.period = 'Please select period';
  } else if (formProps.period === 120) {
    if (!_.isEmpty(formProps.startDate) && !_.isEmpty(formProps.endDate)) {
      if (moment(formProps.startDate).isAfter(formProps.endDate)) {
        errors.endDate = 'End date should be greater than Start date';
      }
    }

    if (!formProps.startDate) {
        errors.startDate = 'Please select start date';
    }

    if (!formProps.endDate) {
        errors.endDate = 'Please select end date';
    }

  } else if (formProps.period === 25) {

    if (!formProps.noOfDays) {
        errors.noOfDays = 'Please enter no of days';
    } else if (formProps.noOfDays) {
      const noOfDay = parseInt(formProps.noOfDays, 10);

      if (!_.isInteger(noOfDay) || noOfDay > 365) {
          errors.noOfDays = 'Please enter a number less than 365';
      }

      if (formProps.noOfDays % 1 !== 0 || formProps.noOfDays < 0) {
        errors.noOfDays = 'Please enter valid number of days';
      }

      if (formProps.noOfDays > 120) {
        errors.noOfDays = 'Please enter number of days less than 120';
      }
    }

  }

    if (!formProps.frequency) {
      errors.frequency = 'Please select frequency';
    }

    if (_.isEqual(formProps.frequency, 'Weekly') &&
      !formProps.frequency_week_Mon && !formProps.frequency_week_Tue &&
      !formProps.frequency_week_Wed && !formProps.frequency_week_Thu &&
      !formProps.frequency_week_Fri && !formProps.frequency_week_Sat &&
      !formProps.frequency_week_Sun) {
        errors.frequency = 'Please select a day';
    }

    if (!formProps.dayOfMonth) {
      errors.dayOfMonth = 'Please select Day of month';
    }

    if (!formProps.monthOfQuarter) {
      errors.monthOfQuarter = 'Please select month of the quater';
    }

    const freqStartDate = moment(formProps.freqStartDate).format('YYYY-MM-DD');
    const freqEndDate = moment(formProps.freqEndDate).format('YYYY-MM-DD');

    if (!_.isEmpty(formProps.freqStartDate) &&
    !_.isEmpty(formProps.freqEndDate)) {
      if (moment(freqStartDate).isAfter(freqEndDate)) {
        errors.freqEndDate = 'End date should be greater than Start date';
      }
    }


    if (!formProps.freqStartDate) {
        errors.freqStartDate = 'Please select start date';
    }

    if (!formProps.freqEndDate) {
        errors.freqEndDate = 'Please select end date';
    }


  if (!formProps.reportActive) {
    errors.reportActive = 'Please select report active or inactive';
  }

  if (!formProps.reportPublic) {
    errors.reportPublic = 'Please select report public';
  }

  // if (!formProps.filterList) {
  //   errors.filterList = 'Please select filters';
  // } else {
  if (formProps.filterList) {
      if (!validateSubFilter(formProps)) {
         errors.filterList = 'Please select values for the filters below';
      }
  }

  if (!formProps.fileName) {
    errors.fileName = 'Please enter file name';
  } else if (formProps.fileName) {
    if (!checkFileNameDelim(formProps.fileName)) {
    errors.fileName = `Please correct file name.
    Only alphanumeric, dash, underscore characters are allowed.`;
    }
  }

  if (!formProps.fileType) {
    errors.fileType = 'Please select file type';
  }

  if (!formProps.runTime) {
    errors.runTime = 'Please enter run time';
  }

  if (!formProps.duration) {
    errors.duration = 'Please enter duration';
  }

  if (formProps.email) {
     if (!checkEmailsCommaDelim(formProps.email)) {
      errors.email = 'Please enter proper email address';
    }
  }

  if ((formProps.hasEmail || formProps.isAlert)  && (!formProps.email)) {
      errors.email = 'Please enter email address';
  }

  if (formProps.hasFtp) {

      if (!formProps.ftpHost) {
          errors.ftpHost = 'Please enter FTP host';
      }
      if (!formProps.ftpUser) {
          errors.ftpUser = 'Please enter FTP user';
      }
      if (!formProps.ftpDir) {
          errors.ftpDir = 'Please enter FTP directory';
      }
      if (!formProps.ftpPwd) {
          errors.ftpPwd = 'Please enter FTP password';
      }
      if (!formProps.ftpPort) {
          errors.ftpPort = 'Please enter FTP port';
      }
  }

    if (formProps.hasS3) {
      if (!formProps.s3Bucket || checkEmptyValue(formProps.s3Bucket)) {
          errors.s3Bucket = 'Please enter S3 Bucket';
      }
      if (!formProps.s3AccessKeyID || checkEmptyValue(formProps.s3AccessKeyID)) {
          errors.s3AccessKeyID = 'Please enter S3 Access Key ID';
      }
      if (!formProps.s3SecretAccessKey || checkEmptyValue(formProps.s3SecretAccessKey)) {
          errors.s3SecretAccessKey = 'Please enter S3 Secret Access Key';
      }
    }
    if( formProps.isSummary)
    {
        let duplNo = [];
        console.log('hjjjjhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
        if((formProps.summaryCount===0 || _.isUndefined(formProps.summaryCount))&&_.isUndefined(formProps['summaryMetric-0'])&&_.isUndefined(formProps['summaryAggregation-0'])){
            errors['summaryMetric-0'] = 'Please select metric';
            errors['summaryAggregation-0'] = 'Please select aggregation';
            errors['summaryMetric-1'] = 'Please select metric';
            errors['summaryAggregation-1'] = 'Please select aggregation';
        }
        // if(!_.isUndefined(formProps["isSummaryRowCheck-0"])){
        //   formProps=_.omit(formProps,"summaryAggregation-"+index);
        //   formProps=_.omit(formProps,"summaryMetric-"+index);
        // }
        _.forEach(formProps, (value, key) => {
          var index = Number(key.slice(-1));
         if (key.startsWith('summaryMetric')) {
             // debugger;
           if(!formProps['summaryMetric-'+(index+1)]){
             errors['summaryMetric-'+(index+1)] = 'Please select metric';
           }
         }
         if (key.startsWith('summaryAggregation')) {
           if(!formProps['summaryAggregation-'+(index+1)]){
             errors['summaryAggregation-'+(index+1)] = 'Please select aggregation';
           }
         }

         if (key.startsWith('summaryMetric')) {
           if(!_.isUndefined(formProps["isSummaryRowCheck-"+index])){
             formProps=_.omit(formProps,"summaryAggregation-"+index);
             formProps=_.omit(formProps,"summaryMetric-"+index);
           }
           if(_.includes(duplNo,value)){
             errors['summaryMetric-'+index] = 'Summary row metric must be unique';
           }else{
             duplNo.push(formProps['summaryMetric-'+index])
           }
         }

       });
    }else{
      // debugger;
      //   _.forEach(formProps, (value, key) => {
      //     var index = Number(key.slice(-1));
      //     if (key.startsWith('summaryMetric')) {
      //         formProps=_.omit(formProps,"summaryAggregation-"+index);
      //         formProps=_.omit(formProps,"summaryMetric-"+index);
      //         formProps=_.omit(formProps,"isSummaryRowCheck-"+index);
      //         formProps['summaryCount'] = 0;
      //     }
      //
      //   });
    }
    if( formProps.isAlert)
    {
          if (!formProps.alertType) {
              errors.alertType = 'Please select alert type';
          }

          if (!formProps.alertMetric) {
              errors.alertMetric = 'Please select alert metric';
          }

          if (formProps.alertType === 'Moving Average') {

              if (!formProps.alertMovingAvgPeriod) {
              errors.alertMovingAvgPeriod = 'Please select moving average period';
              }
          }

          if (!formProps.alertopr) {
              errors.alertopr = 'Please select alert opr';
          }

          var thresholdError = false;
          if (!formProps.alertThreshold1) {
              errors.alertThreshold1 = 'Please enter alert threshold';
              thresholdError =true;
          }
          else if(!formProps.alertThreshold1.match(/^\d+$/)) {
              errors.alertThreshold1 = 'Please enter whole number';
              thresholdError =true;
          }

          if ((formProps.alertopr === 'Between') && !formProps.alertThreshold2) {
              errors.alertThreshold2 = 'Please enter alert threshold';
              thresholdError =true;
          }
          else if((formProps.alertopr === 'Between') && !formProps.alertThreshold2.match(/^\d+$/)) {
              errors.alertThreshold2 = 'Please enter whole number';
                thresholdError =true;
          }

          if((formProps.alertopr === 'Between')  && ((parseFloat(formProps.alertThreshold2) < parseFloat(formProps.alertThreshold1) )
                                                                   || (parseFloat(formProps.alertThreshold2) === parseFloat(formProps.alertThreshold1) )))
          {
            errors.alertThreshold1 = 'value1 shoud be less than value2';
            errors.alertThreshold2 = 'value2 shoud be greater than value1';
          }
      }


  return errors;
};
// }