import * as functions from "firebase-functions";

export const onVoucherUse = functions.database.ref("vouchers/active/{id}/used").onUpdate(async (event) =>{
    const currentUsages = event.data.val();
    const maxUsages = (await event.data.ref.parent.child("usages").once("value")).val();

    console.log(`Used ${currentUsages} out of ${maxUsages}`);
    if (maxUsages === currentUsages) {
        const voucher = (await event.data.ref.parent.once("value")).val();

        console.log(`Voucher "${voucher.code}" (${event.params.id}) is used up. Archiving it.`);

        const updates = {} as any;
        updates[`/vouchers/active/${event.params.id}`] = null;
        updates[`/vouchers/inactive/${event.params.id}`] = voucher;
        return event.data.adminRef.root.update(updates);
    }
});