import { billsTable, draweesInBills, groupsTable, payeesInBills, transactionsTable, usersGroupsTable } from '@/database/schema';
import { client, db } from '@/lib/dbConnect'
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { createUserMap, createBalances } from './utils';


export const POST = async(request : any) => {

    let billId;
    try{
        await db.transaction(async (transaction) => {
            const requestData = await request.json();
            let groupId = requestData.group_id;


            const usersInGroup = await transaction.select().from(usersGroupsTable).where(eq(usersGroupsTable.groupId, groupId));
            
            let userMap = new Map();
            let totalAmount = createUserMap(userMap, requestData, usersGroupsTable);

            usersInGroup.forEach((user) => {
                if(userMap.get(user.userIndex) !== undefined){
                    user.totalAmount = userMap.get(user.userIndex).toString()
                }
            });

            // console.log(usersInGroup);
            // console.log(userMap);

            // console.log(usersInGroup);

            // console.log(userMap);
            // for(let [idx, amt] of userMap){
            //     usersInGroup.
            // }



            
            const newBill = {
                name: requestData.name,
                notes: requestData !== null ? requestData.notes : null,
                amount: totalAmount.toString(),
                groupId: groupId
            };
            
            const balances = createBalances(userMap, groupId);
            
            let bills = await transaction.insert(billsTable).values(newBill).returning({id : billsTable.id});
            billId = bills[0].id;

            await transaction.insert(transactionsTable).values(balances);
            usersInGroup.forEach(async (user) => {
                await transaction.update(usersGroupsTable).set({totalAmount : user.totalAmount}).where(eq(usersGroupsTable.userId, user.userId));
            });

            let drawees = [];
            for(let [idx, amt] of Object.entries(requestData.drawees)){
                drawees.push({
                    billId: billId,
                    userIndex: parseInt(idx),
                    amount: amt as string
                });
            }

            let payees = [];
            for(let [idx, amt] of Object.entries(requestData.payees)){
                payees.push({
                    billId: billId,
                    userIndex: parseInt(idx),
                    amount: amt as string
                });
            }

            await transaction.insert(draweesInBills).values(drawees);
            await transaction.insert(payeesInBills).values(payees);

        });
    }
    catch(err){
        console.log(err);
        return NextResponse.json({message: err}, {status: 400});
    }
    return Response.json({billId : billId}, {status: 201});
}
