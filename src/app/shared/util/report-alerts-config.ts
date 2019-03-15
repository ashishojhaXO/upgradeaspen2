
export const ReportAlertsConfig = {

  alertType: [{
    'label': 'Threshold',
    'value': 'Threshold'
    },
    {
      'label': 'Moving Average',
      'value': 'Moving Average'
    }
  ],

  movingAveragePeriod: [
    {
      'label': '2',
      'value': '2'
    }, {
      'label': '3',
      'value': '3'
    }, {
      'label': '4',
      'value': '4'
    }, {
      'label': '5',
      'value': '5'
    }, {
      'label': '6',
      'value': '6'
    }, {
      'label': '7',
      'value': '7'
    }
  ],

  metrics: [{
    'label': 'Impressions',
    'value': 'Impressions'
  },

    {
      'label': 'Clicks',
      'value': 'Clicks'
    }
  ],

  opr: [
    {
      'label': '>',
      'value': '>'
    },
    {
      'label': '>:',
      'value': '>:'
    },
    {
      'label': '<',
      'value': '<'
    },
    {
      'label': '<:',
      'value': '<:'
    },
    {
      'label': 'Between',
      'value': 'Between'
    }
  ]
};

export const ReportsSummaryConfig = {

  aggregations: [
    {
      'label': 'Sum',
      'value': 'sum'
    },
    {
      'label': 'Average',
      'value': 'average'
    },
    {
      'label': 'Pick First',
      'value': 'pick_first'
    }
  ]
};
