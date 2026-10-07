const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
    const { GVHeaderSet, GiftVoucherSet, AssignGiftVoucherSet } = this.entities;

    this.before('CREATE', 'GVHeaderSet', async (req) => {
        const data = req.data;
        const type = data.gvr_type_code; // CI, RT, RP

        // 1. Generate Sequential ID
        let startValue;
        if (type === 'CI') startValue = 10000001;
        else if (type === 'RT') startValue = 20000001;
        else if (type === 'RP') startValue = 30000001;
        else return req.error(400, `Invalid gvr_type_code: ${type}`);

        const tx = cds.transaction(req);
        const lastGV = await tx.read(GVHeaderSet)
                               .where({ gvr_type_code: type })
                               .orderBy('gv_no desc')
                               .limit(1)
                               .forUpdate();

        data.gv_no = lastGV.length && lastGV[0].gv_no ? Number(lastGV[0].gv_no) + 1 : startValue;

        // 2. Validate and Adjust Inventory
        if (type === 'CI') {
            if (!data.campaign_name) return req.error(400, "Campaign name is mandatory for CI.");
            if (!data.assignGiftVouchers || data.assignGiftVouchers.length === 0) {
                return req.error(400, "At least one gift voucher must be assigned.");
            }

            for (const item of data.assignGiftVouchers) {
                const voucher = await tx.read(GiftVoucherSet).where({ ID: item.giftVoucher_ID });
                if (!voucher.length) return req.error(400, `Voucher ${item.giftVoucher_ID} not found.`);
                if (voucher[0].stock < item.issue_quantity) {
                    return req.error(400, `Insufficient stock for voucher ${voucher[0].coupon}.`);
                }
                item.current_quantity = item.issue_quantity; // initialize active quantity
                await tx.update(GiftVoucherSet).set({ stock: { '-=': item.issue_quantity } }).where({ ID: item.giftVoucher_ID });
            }
        } 
        else if (type === 'RT') {
            if (!data.returnGiftsTotal_amt) return req.error(400, "Return total amount is mandatory.");
            if (!data.returnGiftVouchers || data.returnGiftVouchers.length === 0) {
                return req.error(400, "At least one return voucher line is required.");
            }

            for (const rItem of data.returnGiftVouchers) {
                if (!rItem.RT_Ass_GiftVoucher_ID) return req.error(400, "Original assignment reference is mandatory.");
                
                // Get original assignment to adjust active quantity
                const origAss = await tx.read(AssignGiftVoucherSet).where({ ID: rItem.RT_Ass_GiftVoucher_ID });
                if (!origAss.length) return req.error(400, "Original assignment not found.");
                
                if (origAss[0].current_quantity < rItem.issue_quantity) {
                    return req.error(400, "Cannot return more than the active assigned quantity.");
                }

                // Restore stock to master
                await tx.update(GiftVoucherSet).set({ stock: { '+=': rItem.issue_quantity } }).where({ ID: origAss[0].giftVoucher_ID });
                // Reduce active quantity in original assignment
                await tx.update(AssignGiftVoucherSet).set({ current_quantity: { '-=': rItem.issue_quantity } }).where({ ID: rItem.RT_Ass_GiftVoucher_ID });
            }
        }
        else if (type === 'RP') {
            // Replace is a mix of Return and Issue
            const returnAmt = parseFloat(data.returnGiftsTotal_amt || 0);
            const assignAmt = parseFloat(data.assignGiftsTotal_amt || 0);
            
            if (assignAmt > returnAmt) {
                return req.error(400, "Replacement amount cannot exceed return amount.");
            }

            // Process Returns (Restore stock)
            for (const rItem of data.returnGiftVouchers || []) {
                const origAss = await tx.read(AssignGiftVoucherSet).where({ ID: rItem.RT_Ass_GiftVoucher_ID });
                if (!origAss.length) return req.error(400, "Original assignment not found.");
                if (origAss[0].current_quantity < rItem.issue_quantity) {
                    return req.error(400, "Cannot return more than the active assigned quantity.");
                }
                await tx.update(GiftVoucherSet).set({ stock: { '+=': rItem.issue_quantity } }).where({ ID: origAss[0].giftVoucher_ID });
                await tx.update(AssignGiftVoucherSet).set({ current_quantity: { '-=': rItem.issue_quantity } }).where({ ID: rItem.RT_Ass_GiftVoucher_ID });
            }

            // Process New Assignments (Deduct stock)
            for (const aItem of data.assignGiftVouchers || []) {
                const voucher = await tx.read(GiftVoucherSet).where({ ID: aItem.giftVoucher_ID });
                if (!voucher.length) return req.error(400, `Voucher ${aItem.giftVoucher_ID} not found.`);
                if (voucher[0].stock < aItem.issue_quantity) {
                    return req.error(400, `Insufficient stock for voucher ${voucher[0].coupon}.`);
                }
                aItem.current_quantity = aItem.issue_quantity;
                await tx.update(GiftVoucherSet).set({ stock: { '-=': aItem.issue_quantity } }).where({ ID: aItem.giftVoucher_ID });
            }
        }
    });
});
