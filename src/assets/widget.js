var vendor_details = null,selectedPaymentType = 'ach';

console.log("BEFFFWIDGETTTTTTT", fs_widget_config );

// TODO: Remove Later, this `some` function
// var some = function() {

$(document).ready(function () {
    console.log("WIDGETTTTTTT")
    if ($('#fs_widget').length) {

    console.log("fsWIDLen")

        appendScripts();
        appendStyles();

        setTimeout(function () {
            if(window.location.href.indexOf('air_payment') !== -1) {
                finalizePayment();
            }
        }, 500);

        setProperties();

        console.log('valid !!!');
        $('#fs_widget').css('margin', '0px 5px');

        const titleDiv = $('<div/>', {
            style: 'background-color:' + fs_widget_config.title.backgroundColor + ';color: ' + fs_widget_config.title.color
        });

        // titleDiv.append('<h2 style="padding: 10px 0px; margin: 0px 5px">' + fs_widget_config.title.text + '</h2>');
        // $('#fs_widget').append(titleDiv);

        // Payment Status
        $('#fs_widget').append('<div id="paymentStatus" style="text-align: center; border: 2px dotted; margin: 10px 0px; border-radius: 4px"><span></span></div>');

        $('#paymentStatus').hide();
        $('.sectionPayment').hide();


        // if (fs_widget_config.displayExistingPayment) {
            // renderExistingPayments();
        // }

        renderForm1();
        renderPayment();

    } 
    else {
        throw "No Element found with id : fs_widget"
    }
});

// }

function setProperties() {
    if(fs_widget_config) {
        if(fs_widget_config.title) {
            if(!fs_widget_config.title.text) {
                fs_widget_config.title.text = 'Payment Type';
            }
            if(!fs_widget_config.title.color) {
                fs_widget_config.title.color = '#000';
            }
        } else {
            fs_widget_config.title = {
                text: 'Payment Type',
                color: '#000',
            }
        }

        if(fs_widget_config.button) {
            if(!fs_widget_config.button.text) {
                fs_widget_config.button.text = 'Submit';
            }
            if(!fs_widget_config.button.backgroundColor) {
                fs_widget_config.button.backgroundColor = '#007bff';
            }
            if(!fs_widget_config.button.color) {
                fs_widget_config.button.color = '#fff';
            }
        } else {
            fs_widget_config.button = {
                text: 'Submit',
                backgroundColor: '#007bff',
                color: '#fff',
            }
        }

    } else {
        fs_widget_config = {
            title: {
                text: 'Payment Type',
                color: '#000',
            },
            button: {
                text: 'Submit',
                backgroundColor: '#007bff',
                color: '#fff'
            }
        }
    }
}

function appendStyles() {
    // $('#fs_widget').append('<link rel="stylesheet" href="https://unpkg.com/bootstrap-table@1.14.2/dist/bootstrap-table.min.css" rel="stylesheet">');
    // $('#fs_widget').append('<link rel="stylesheet" href="https://cdn.datatables.net/1.10.19/css/jquery.dataTables.min.css" rel="stylesheet">');
    // $('#fs_widget').append('<link href="https://static.accelitas.io/css/bootstrap.min.css" rel="stylesheet">');
    $('#fs_widget').append('<link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">');

}

function appendScripts() {
    $('#fs_widget').append('<script src="https://#S3DIRECTORY#/config.js"></script>');
    // $('#fs_widget').append('<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js"></script>');
    // $('#fs_widget').append('<script src="https://unpkg.com/bootstrap-table@1.14.2/dist/bootstrap-table.min.js"></script>');
    // $('#fs_widget').append('<script src="https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js"></script>');
    $('#fs_widget').append('<script src="https://www.jqueryscript.net/demo/Loading-Spinner-Sprite-Animation-jQuery-Preloaders/jquery.preloaders.js"></script>');
    $('#fs_widget').append('<script src="https://unpkg.com/popper.js@1"></script>');
    $('#fs_widget').append('<script src="https://unpkg.com/tippy.js@4"></script>');
}

function renderExistingPayments() {
    console.log("renderExistingPayments", fs_widget_config);

    if(!fs_widget_config.user_uuid) {
        return;
    }

    $('#fs_widget').find('.section0').remove();

    var data = {
        // 'vendor_id': fs_widget_config.vendor_id
        'user_id': fs_widget_config.user_uuid
    };

    $.ajax({
        url: api_domain_base + 
        // "/api/silver/vendor-payment-methods",
        "/api/payments/widget/user-payment-methods",
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: "json",
        headers: {
            'Content-Type': 'application/json',
            'org_id': fs_widget_config.org_id,
            'x-api-key': fs_widget_config.api_key
        },
        success: function (res) {
            if(res && res.body) {

                // Create Existing Payment Details
                const sectionDiv0 = $('<div/>', {
                    style: 'margin: 20px 0px 40px 10px',
                    class: 'section0'
                });

                const container1FormDiv = $('<div/>', {
                    class : 'section0Details'
                });

                const existingPayments = $('<tbody/>');
                res.body.forEach(function (option) {
                    const tr = $('<tr/>',{
                        style :"background: blanchedalmond"
                    });
                    tr.append('<td style="width:40%; padding: 15px;"><span style="font-size: 12px;margin-left: 15px">' + (option.payment_method === 'ACH' ? ('xxxxxxxx' + option.last_four_digits) : ('xxxx-xxxx-' + option.last_four_digits)) + '</span></td>');

                    const statusTD = $('<td/>', {
                        style : 'width:50%; padding: 15px'
                    });
                    statusTD.append('<span style="font-size: 12px; padding: 15px">' + (option.status ? option.status.toUpperCase() : '-') + '</span>');
                    if(option.status && option.status.toUpperCase() === 'PAYMENT SETUP PENDING') {
                        statusTD.append('<i class="fa fa-question-circle hover" style="margin-left: 5px; position: relative; top: 1px; left: -10px;" data-toggle="tooltip" data-placement="top"></i>');
                    }
                    tr.append(statusTD);
                    tr.append('<td style="width:10%; padding: 15px;"><input disabled="disabled" type="radio" name="default" checked=\' + (option.is_default == \'1\' ? true : false) + \'/></td>');
                    existingPayments.append(tr);
                });

                container1FormDiv.append('<div class="col-md-2 col-lg-2 col-sm-0" style="display: inline-block"></div>');
                container1FormDiv.append('<div class="col-md-10 col-lg-10 col-sm-12" style="display: inline-block;"><table style="border-collapse:separate; border-spacing: 0 1em;"><thead><tr><th style="width:40%; font-weight: 200;font-size: 0.9375rem;">Existing Payment Information</th><th style="width:50%;font-weight: 200;font-size: 0.9375rem; position: relative;left: 27px;">Status</th><th style="width:10%; font-weight: 200;font-size: 0.9375rem;">Default</th></tr></thead><tbody>' + existingPayments.html() + '</tbody></table></div>');
                sectionDiv0.append(container1FormDiv);

                $('#fs_widget').prepend(sectionDiv0);

                setTimeout(function () {
                    // FTM
                    // tippy('i.hover', {
                    //     content: '<div style="width: 100%; margin: 5px;">\n' +
                    //         '                                        <p style="padding: 10px">\n' +
                    //         '                                            <b>Payment Information Received</b>\n' +
                    //         '                                            <br/>\n' +
                    //         '                                            <br/>\n' +
                    //         '                                            <span>We have received your payment details and it is currently being processed.\n' +
                    //         '                                                <br/>\n' +
                    //         '                                                It would take approximately 15 minutes after which updates will be reflected.\n' +
                    //         '                                                </span>\n' +
                    //         '                                        </p>\n' +
                    //         '                                    </div>',
                    // })
                }, 1000);
            }
        },
        error: function (er) {
            console.log('error !!!!');
            console.log(er);
        }
    });
}

function renderForm1() {
    console.log("renderForm1");
    // Create Vendor Form
    const sectionDiv1 = $('<div/>', {
        style: 'margin: 20px 0px 40px 10px',
        class: 'section1'
    });

    const container1FormDiv = $('<div/>', {
        class : 'section1Details'
    });

    container1FormDiv.append(
        '<div class="col-md-2 col-lg-2 col-sm-12" style="margin-bottom: 10px; display: inline-block;"><label style="margin: 0px; padding: 0px; color:' 
        + fs_widget_config.title.color + ';">' 
        + fs_widget_config.title.text + '</label></div>'
    );
    container1FormDiv.append(
        '<div class="col-md-10 col-lg-10 col-sm-12" style="margin-bottom: 10px; display: inline-block"><div class="col-lg-6 col-md-6 col-sm-12" style="font-size: 13px; display: inline-block;"><div class="col-lg-3 col-md-5 col-sm-12" style="display: inline-block"><input type="radio" style="padding: 0px; margin: 0px; position: relative; display: inline-block" checked="checked" name="paymentType" value="ach" onchange="updatePaymentType(\'ach\')"><label style="padding: 0px; margin: 0px 0px 0px 5px; position: relative; display: inline-block">ACH</label></div><div class="col-lg-3 col-md-5 col-sm-12" style="display: inline-block"><input style="padding: 0px; margin: 0px; position: relative; display: inline-block" type="radio" name="paymentType" value="cc" onchange="updatePaymentType(\'cc\')"><label style="padding: 0px; margin: 0px 0px 0px 5px; position: relative; display: inline-block">CC</label></div><button class="btn btn-sm" style="background-color:' 
        + fs_widget_config.button.backgroundColor + ';color:' 
        + fs_widget_config.button.color + ';" onclick="editPaymentDetails()">' 
        + fs_widget_config.button.text 
        + '</button></div></div>'
    );


    // const action1Div = $('<div/>', {
    //     class: 'col-md-12 col-lg-12 col-sm-12',
    //     style: 'margin-bottom: 10px'
    // });
    // action1Div.append('<label class="col-md-3 col-lg-3 col-sm-3"></label>');
    // action1Div.append('');
    // container1FormDiv.append(action1Div);

    const status1Div = $('<div/>', {
        class: 'col-md-12 col-lg-12 col-sm-12',
        style: 'margin-bottom: 10px'
    });

    status1Div.append('<label class="col-md-3 col-lg-3 col-sm-3"></label>');
    status1Div.append('<span id="status"></span>');

    container1FormDiv.append(status1Div);
    sectionDiv1.append(container1FormDiv);
    $('#fs_widget').append(sectionDiv1);
}

function renderPayment() {
    console.log("renderPayment")
    // Create Payment Container
    const sectionPayment = $('<div/>', {
        style: '',
        class: 'sectionPayment'
    });

    const sectionPaymentContent = $('<div/>', {
        class: 'content'
    });

    sectionPaymentContent.append('<iframe id="payment_iFrame" frameborder="0" style="height: 0px !important;"></iframe>')
    sectionPayment.append(sectionPaymentContent);
    $('#fs_widget').append(sectionPayment);
}

function editPaymentDetails() {

    // if(!fs_widget_config.vendor_id) {
    if(!fs_widget_config.user_uuid) {
        alert('No User ID found');
        return;
    }

    // FTM: Comment out
    // $.preloader.start({
    //     modal: true
    // });

    window.history.replaceState(null, null, window.location.pathname);

    // window.location.assign(window.location.href.replace(window.location.search,''));

    //  window.location.href.replace(window.location.search,'');

    $(document.body).css({'cursor' : 'wait'});

    var data = {
        // 'vendor_id': fs_widget_config.vendor_id
        'user_id': fs_widget_config.user_uuid
    };

    // $.ajax({
        // url: api_domain_base + 
        // // "/api/silver/app-token",
        // "/api/payments/widget/user-token",
        // type: "POST",
        // data: JSON.stringify(data),
        // contentType: "application/json",
        // dataType: "json",
        // headers: {
        //     'Content-Type': 'application/json',
        //     'org_id': fs_widget_config.org_id,
        //     'x-api-key': fs_widget_config.api_key
        // },
        // success: function (res) {
        //     if (res.body && res.body.app_token) {
                // const data1 = {
                //     'app_token': res.body.app_token
                // };

                // $.ajax({
                    // url: api_domain_base + "/api/silver/vendor-by-app-token",
                    // type: "POST",
                    // data: JSON.stringify(data1),
                    // contentType: "application/json",
                    // dataType: "json",
                    // headers: {
                    //     'Content-Type': 'application/json',
                    //     'org_id': fs_widget_config.org_id,
                    //     'x-api-key': fs_widget_config.api_key
                    // },
                    // success: function (res1) {
                        // console.log('success getVendorDetails');
                        // console.log(res1);
                        // vendor_details = res1.body;
                        // localStorage.setItem('fs_vendor_details', JSON.stringify(vendor_details));

// Here------------------- 
                        const data2 = {
                            // vendor_uuid : fs_widget_config.vendor_id,
                            user_id: fs_widget_config.user_uuid,
                            payment_type : selectedPaymentType,
                            redirecturl : window.location.href + ( window.location.href.indexOf('?') === -1 ? '?' : '&' )  + 'air_payment'
                        };

                        $.ajax({
                            url: api_domain_base + 
                            // "/api/silver/vendor-token",
                            "/api/payments/widget/user-token",
                            type: "POST",
                            data: JSON.stringify(data2),
                            contentType: "application/json",
                            dataType: "json",
                            headers: {
                                'Content-Type': 'application/json',
                                'org_id' : fs_widget_config.org_id,
                                'x-api-key': fs_widget_config.api_key
                            },
                            success: function (res) {
                                console.log("usTOK Succ: ", res)
                                // if (res.body && res.body.external_token) {
                                if (res.body && res.body.token_id) {
                                console.log("usTOK Succ IF")
                                    localStorage.setItem('payment_token', res.body.token_id);
                                    localStorage.setItem('api_key', fs_widget_config.api_key);
                                    localStorage.setItem('org_id', fs_widget_config.org_id);
                                    localStorage.setItem('vendor_id', fs_widget_config.vendor_id);
                                
                                    console.log("usTOK Succ DOM ID: ", payment_domain_base + res.body.token_id)
    // FTM
    var payment_domain_base = 'https://stage.snappayglobal.com/interop/interoprequest?reqno=';


                                    $('#payment_iFrame').attr('src', payment_domain_base + res.body.token_id);
                                    $('#payment_iFrame').css('width', '100%');
                                    // FIX : change height of the payment form based on selection
                                    if(selectedPaymentType == 'ach') {
                                console.log("usTOK Succ ACH")
                                        $('#payment_iFrame').attr('style', 'width: 100%; height: 400px !important');
                                    } else if (selectedPaymentType == 'cc') {
                                console.log("usTOK Succ CC")
                                        $('#payment_iFrame').attr('style', 'width: 100%; height: 450px !important');
                                    }
                                    // if(selectedPaymentType === 'ach') {
                                    //     $(document).find('#payment_iFrame').on('load', function () {
                                    //         setTimeout(function () {
                                    //             console.log('$(\'#payment_iFrame\').contents().find(\'#bpifrm\') >>')
                                    //             console.log($("#payment_iFrame").contents().find('html'));
                                    //             $("#payment_iFrame").contents().find('#bpifrm').css('height', '875px')
                                    //         }, 2000);
                                    //     });
                                    // }
                                    $('#fs_widget .sectionPayment').fadeIn("slow");

                                    // FTM
                                    // $.preloader.stop();
                                    $(document.body).css({'cursor' : 'default'});
                                }

                                console.log('ELLLSE');
                            },
                            error: function (er) {
                                console.log('error !!!!');
                                console.log(er);
                                $.preloader.stop();
                                $(document.body).css({'cursor' : 'default'});
                            }
                        });
// Here------------------- /

                    // },
                    // error: function (er) {
                    //     console.log('error !!!!');
                    //     console.log(er);
                    //     $.preloader.stop();
                    //     $(document.body).css({'cursor' : 'default'});
                    // }
                // });
        //     }
        // },
        // error: function (er) {
        //     console.log('error !!!!');
        //     console.log(er);
        //     $.preloader.stop();
        //     $(document.body).css({'cursor' : 'default'});
        // }
    // });
}

function updatePaymentType(type) {
    selectedPaymentType = type;
}

function finalizePayment() {
    const vendor_details = JSON.parse(localStorage.getItem('fs_vendor_details')) || '';
    const payment_token = localStorage.getItem('payment_token') || '';
    const api_key = localStorage.getItem('api_key') || '';
    const org_id = localStorage.getItem('org_id') || '';
    const vendor_id = localStorage.getItem('vendor_id') || '';

    if( payment_token && api_key) {

        localStorage.removeItem('fs_vendor_details');
        localStorage.removeItem('payment_token');
        localStorage.removeItem('api_key');
        localStorage.removeItem('org_id');
        localStorage.removeItem('vendor_id');

        const data = {
            // customer_id : vendor_details.customer_id,
            external_token: payment_token,
            // checkUploadStatus: true
        };

        $.ajax({
            url: api_domain_base + 
            // "/api/silver/payment-method-upload/finalize",
            "/api/payments/widget/payment-method-upload/finalize",
            type: "POST",
            data: JSON.stringify(data),
            // contentType: "application/json",
            dataType: "json",
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': api_key,
                'org_id' : org_id
            },
            success: function (res1) {
                if(res1 && res1.body) {

                    // $('#paymentStatus').fadeIn("slow", function () {
                    //     $('#paymentStatus span').text('Payment Successfully Submitted');
                    // });

                    let queryParams = '';
                    for(var prop in res1.body) {
                        queryParams += '&' + prop + '=' + res1.body[prop];
                    }
                    window.location.href = window.location.href.replace('air_payment=','') + 'paymentStatus=success'; // + 'vendor_id=' + vendor_id

                    // if(fs_widget_config.redirectUrl) {
                    //     window.location.href = fs_widget_config.redirectUrl;
                    // } else {
                    //
                    // }
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                window.location.href = window.location.href.replace('air_payment=','') + 'paymentStatus=failed';
            }
        });
    }
}

// TODO: Remove Later
var api_domain_base = "https://plazo-dev.fusionseven.net";
