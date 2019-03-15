const dimesionList = [
  {id: 'A1_All', label: 'Dimension 1'},
  {id: 'partner_code', label: 'Dimension 2'},
  {id: 'advertiser_name', label: 'Dimension 3'}
  ];

const allDimensionList = [
  {
    "isStaticField": true,
    "isCustomField": false,
    "isCustomAlias": false,
    "f7_name": "Custom",
    "report_alias": "A2_Custom_Dimension",
    "partnerType": [
      "tpas",
      "prov"
    ],
    "_id": "5ac209590313876abbaf358f"
  },
  {
    "isStaticField": false,
    "isCustomField": false,
    "isCustomAlias": false,
    "partnerType": [
      "tpas",
      "prov"
    ],
    "report_alias": "A1_All",
    "f7_name": "A1_All",
    "_id": "5ac209590313876abbaf358e"
  },
  {
    "isStaticField": false,
    "isCustomField": false,
    "isCustomAlias": false,
    "_id": "58ece1f00aaf3c05c8b05651",
    "partnerType": [
      "tpas",
      "prov"
    ],
    "report_alias": "Client Code",
    "f7_name": "client_code"
  },
  {
    "isStaticField": false,
    "isCustomField": false,
    "isCustomAlias": false,
    "_id": "58ece1f00aaf3c05c8b05651",
    "partnerType": [
      "tpas",
      "prov"
    ],
    "report_alias": "Client Name",
    "f7_name": "client_name"
  },
  {
    "isStaticField": false,
    "isCustomField": false,
    "isCustomAlias": false,
    "_id": "58ece1f00aaf3c05c8b05651",
    "partnerType": [
      "tpas",
      "prov"
    ],
    "report_alias": "Partner Type",
    "f7_name": "partner_type"
  },
  {
    "isStaticField": false,
    "isCustomField": false,
    "isCustomAlias": false,
    "_id": "58ece1f00aaf3c05c8b05651",
    "partnerType": [
      "tpas",
      "prov"
    ],
    "report_alias": "Partner Code",
    "f7_name": "partner_code"
  },
  {
    "isStaticField": false,
    "isCustomField": false,
    "isCustomAlias": false,
    "_id": "58ece1f00aaf3c05c8b05651",
    "partnerType": [
      "tpas",
      "prov"
    ],
    "report_alias": "Partner Name",
    "f7_name": "partner_name"
  },
  {
    "isStaticField": false,
    "isCustomField": false,
    "isCustomAlias": false,
    "_id": "58ece1f00aaf3c05c8b05651",
    "partnerType": [
      "tpas",
      "prov"
    ],
    "report_alias": "Country Code",
    "f7_name": "country_code"
  },
  {
    "isStaticField": false,
    "isCustomField": false,
    "isCustomAlias": false,
    "_id": "58ece1f00aaf3c05c8b05651",
    "partnerType": [
      "tpas",
      "prov"
    ],
    "report_alias": "Advertiser ID",
    "f7_name": "advertiser_id"
  },
  {
    "isStaticField": false,
    "isCustomField": false,
    "isCustomAlias": false,
    "_id": "58ece1f00aaf3c05c8b05651",
    "partnerType": [
      "tpas",
      "prov",
      "veri"
    ],
    "report_alias": "Advertiser Name",
    "f7_name": "advertiser_name"
  },
  {
    "isStaticField": false,
    "isCustomField": false,
    "isCustomAlias": false,
    "_id": "58ece1f00aaf3c05c8b05651",
    "partnerType": [
      "tpas",
      "prov"
    ],
    "report_alias": "Campaign ID",
    "f7_name": "campaign_id"
  },
];


const comparer = (otherArray) => {
  return (current) => {
    return otherArray.filter((other) => {
      return other.id === current.f7_name
    }).length !== 0;
  };
};

const selectedDimension = allDimensionList.filter(comparer(dimesionList));
console.log(selectedDimension);
