import { transactionsTable } from '@/database/schema';
import { client, db } from '@/lib/dbConnect'
import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';


export const POST = async(request : any) => {

    let balances;
    try{
        await db.transaction(async (transaction) => {
            const requestData = await request.json();
            let groupId = requestData.group_id;
            let userIndex = requestData.user_index;

            balances = await transaction.select().from(transactionsTable).where(eq(transactionsTable.groupId, groupId));

        });
    }
    catch(err){
        console.log(err);
        return NextResponse.json({message: err}, {status: 400});
    }
    return Response.json({transactions : balances}, {status: 200});
}
