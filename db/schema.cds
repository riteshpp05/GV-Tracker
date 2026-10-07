namespace com.mall.gvtracker;

entity ShoppingMall {
    key plant_code : String(10);
    plant_name     : String(100);
}

entity GiftVoucher {
    key ID       : UUID;
    coupon       : String(50);
    material     : String(50);
    stock        : Integer;
    price        : Decimal(10,2);
    brand        : String(100);
    expDate      : Date;
    type         : String(20);
}

entity Customer {
    key ID             : UUID;
    email              : String(100);
    phone              : String(20);
    name               : String(100);
    phoneCode          : String(5);
    salutation         : String(10);
    shoppingMall_ID    : String(10); 
}

entity Employee {
    key code           : String(50);
    name               : String(100);
    designation        : String(100);
    shoppingMall_ID    : String(10);
}

entity GVHeader {
    key ID                 : UUID;
    gv_no                  : Integer;
    gvr_type_code          : String(10); // CI, RT, RP
    campaign_name          : String(100);
    customer_ID            : UUID;
    employee_code          : String(50);
    assignGiftsTotal_amt   : Decimal(10,2);
    returnGiftsTotal_amt   : Decimal(10,2);
    
    // Compositions (Line Items)
    assignGiftVouchers     : Composition of many AssignGiftVoucher on assignGiftVouchers.GVHeader_ID = $self.ID;
    returnGiftVouchers     : Composition of many ReturnGiftVoucher on returnGiftVouchers.GVHeader_ID = $self.ID;
    bills                  : Composition of many Bill on bills.GVHeader_ID = $self.ID;
}

entity AssignGiftVoucher {
    key ID              : UUID;
    GVHeader_ID         : UUID;
    giftVoucher_ID      : UUID;
    issue_quantity      : Integer;
    current_quantity    : Integer;
    total_amount        : Decimal(10,2);
}

entity ReturnGiftVoucher {
    key ID                     : UUID;
    GVHeader_ID                : UUID;
    RT_Ass_GiftVoucher_ID      : UUID;
    issue_quantity             : Integer;
    total_amount               : Decimal(10,2);
}

entity Bill {
    key ID              : UUID;
    GVHeader_ID         : UUID;
    sr_no               : Integer;
    b_no                : String(50);
    b_amount            : Decimal(10,2);
    attachment_ID       : UUID;
}

entity Attachment {
    key ID          : UUID;
    @Core.MediaType : contentType
    content         : LargeBinary;
    @Core.IsMediaType : true
    contentType     : String;
    fileName        : String;
    size            : Integer;
}
