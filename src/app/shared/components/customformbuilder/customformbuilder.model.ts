export class field {
    id?: any;
    name?: any;
    dropName?: any;
    type?: any;
    dropType?: any;
    icon?: any;
    toggle?: any;
    label?: any;
    inline?: any;
    default_value?: any;
    values?: Array<value>;
    attr_list?: any;
    validation?: any;
    disable?: any;
}

export class value {
    label?: any = "";
    value?: any = "";
}