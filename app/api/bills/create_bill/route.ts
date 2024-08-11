import { billsTable, groupsTable, transactionsTable, usersGroupsTable } from '@/database/schema';
import { client, db } from '@/lib/dbConnect'
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';


export const POST = async(request : any) => {

    let billId;
    try{
        await db.transaction(async (transaction) => {
            const requestData = await request.json();
            let groupId = requestData.group_id;


            const usersInGroup = await transaction.select().from(usersGroupsTable).where(eq(usersGroupsTable.groupId, groupId));
            
            let userMap = new Map();
            let totalDrawn = 0, totalPaid = 0

            for(let [idx, amt] of Object.entries(requestData.drawees)){
                let index = parseInt(idx), amount = parseInt(amt as string);
                if(index >= usersInGroup.length){
                    throw new Error("User Index Error");
                }
                totalDrawn += amount;
                userMap.set(index, -1 * amount);
            }

            for(let [idx, amt] of Object.entries(requestData.payees)){
                let index = parseInt(idx), amount = parseInt(amt as string);
                if(index >= usersInGroup.length){
                    throw new Error("User Index Error");
                }
                totalPaid += amount;
                if(userMap.get(index) === undefined){
                    userMap.set(index, amount);
                }
                else{
                    userMap.set(index, amount + userMap.get(index));
                }
            }

            // console.log(usersInGroup);
            // console.log(userMap);

            usersInGroup.forEach((user) => {
                if(userMap.get(user.userIndex) !== undefined){
                    user.totalAmount = userMap.get(user.userIndex).toString()
                }
            });

            // console.log(usersInGroup);

            // console.log(userMap);
            // for(let [idx, amt] of userMap){
            //     usersInGroup.
            // }


            if(totalDrawn != totalPaid){
                throw new Error("Drawn and Paid Amount mismatch");
            }

            
            const newBill = {
                name: requestData.name,
                notes: requestData !== null ? requestData.notes : null,
                amount: totalPaid.toString(),
                groupId: groupId
            };
            
            const balances = createBalances(userMap, groupId);
            
            billId = await transaction.insert(billsTable).values(newBill).returning({id : groupsTable.id});
            await transaction.insert(transactionsTable).values(balances);
            usersInGroup.forEach(async (user) => {
                await transaction.update(usersGroupsTable).set({totalAmount : user.totalAmount}).where(eq(usersGroupsTable.userId, user.userId));
                
                // TODO: ADD USER BILLS

            });
        });
    }
    catch(err){
        return NextResponse.json({message: err}, {status: 400});
    }
    return Response.json({message : billId}, {status: 201});
}


function createBalances(userMap: Map<number, number>, groupId : any){
    
    let negMap = new Map(), posMap = new Map();
    let balances = [];
    for(let [idx, amt] of userMap.entries()){
        if(amt < 0)
            negMap.set(idx, amt);
        else if(amt > 0)
            posMap.set(idx, amt);
    }

    // console.log(negMap);
    // console.log(posMap);
    // console.log(negMap.size);
    // console.log(posMap.size);

    let i = 0, j = 0;

    let posMapKeys = posMap.keys().toArray();
    let negMapKeys = negMap.keys().toArray();
    let curNegIdx = 0, curPosIdx = 0, curNegAmt = 0, curPosAmt = 0;

    while(i < posMap.size && j < negMap.size){

        curNegIdx = negMapKeys[j];
        curNegAmt = negMap.get(curNegIdx);

        curPosIdx = posMapKeys[i];
        curPosAmt = posMap.get(curPosIdx);
        
        let mn = Math.min(-1 * curNegAmt, curPosAmt);

        curPosAmt -= mn;
        curNegAmt += mn;
        balances.push({
            groupId : groupId,
            user1Index : curPosIdx,
            user2Index : curNegIdx,
            balance : mn.toString()
        });

        balances.push({
            groupId : groupId,
            user1Index : curNegIdx,
            user2Index : curPosIdx,
            balance : (-1 * mn).toString()
        })

        while(curNegAmt == 0){
            ++j;
            curNegIdx = negMapKeys[j];
            curNegAmt = negMap.get(curNegIdx);
        }
        while(curPosAmt == 0){
            ++i;
            curPosIdx = posMapKeys[i];
            curPosAmt = posMap.get(curPosIdx);
        }

    }

    return balances;
    
}