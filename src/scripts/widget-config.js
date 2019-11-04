var fs_widget_config = {
    // conguration for payment type label ( optional )
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
    org_id: '1aab2e8a-db03-11e9-9725-06858dc5c004', // required
    api_key: '3206e8f3db0311e9972506858dc5c004', // required
    // vendor_id: 'd5b3f693-1a86-407f-8732-04cb349e605d', // required
    api_domain: 'https://plazo-dev.fusionseven.net', // required
    payment_domain: 'https://www.snappayglobal.com/interop/interoprequest?reqno=', // required
    redirectUrl: '',  // if left empty, the page would refresh ( optional ),
    displayExistingPayment: false
}
