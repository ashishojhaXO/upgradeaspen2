var fs_widget_config = {
    // conguration for payment type label ( optional )
    title: {
        text: 'Payment Type', // default : Payment Type
        backgroundColor: '#fff', // default : #fff ( accepts all hash, name or rgba )
        color: '#000', // default : #000 ( accepts all hash, name or rgba )
    },
    label: {
        text: 'Payment Type', // default : Payment Type
        backgroundColor: '#fff', // default : #fff ( accepts all hash, name or rgba )
        color: '#000', // default : #000 ( accepts all hash, name or rgba )
    },
    // conguration for payment submit button ( optional )
    button: {
        text: 'Submit', // default : Submit
        backgroundColor: '#007bff', // default : #007bff ( accepts all hash, name or rgba )
        color: '#fff' // default : #fff ( accepts all hash, name or rgba )
    },
    org_id: '', // required
    api_key: '', // required
    // vendor_id: 'd5b3f693-1a86-407f-8732-04cb349e605d', // required
    api_domain: 'https://plazo-dev.fusionseven.net', // required
    payment_domain: 'https://www.snappayglobal.com/interop/interoprequest?reqno=', // required
    redirectUrl: '',  // if left empty, the page would refresh ( optional ),
    displayExistingPayment: false
};

var air_widget_config = fs_widget_config;
