using { com.mall.gvtracker as db } from '../db/schema';

service GV_trackerService {
    
    // Read & Write (Transactional)
    entity GVHeaderSet as projection on db.GVHeader;
    entity CustomerSet as projection on db.Customer;
    entity AttachmentSet as projection on db.Attachment;

    // Read-only (Master Data)
    @readonly entity ShoppingMallSet as projection on db.ShoppingMall;
    @readonly entity GiftVoucherSet as projection on db.GiftVoucher;
    @readonly entity EmployeeSet as projection on db.Employee;
    
    // Exposing the composition line items directly is usually read-only 
    @readonly entity AssignGiftVoucherSet as projection on db.AssignGiftVoucher;
    @readonly entity ReturnGiftVoucherSet as projection on db.ReturnGiftVoucher;
    @readonly entity BillSet as projection on db.Bill;
}
