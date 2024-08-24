export function createUserMap(userMap: Map<number, number>, requestData : any, usersInGroup : any){
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
            userMap.set(index, amount + userMap.get(index)!);
        }
    }

    if(totalDrawn != totalPaid){
        throw new Error("Drawn and Paid Amount mismatch");
    }

    return totalPaid;
}




export function createBalances(userMap: Map<number, number>, groupId : any){
    
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

    let posMapKeys = Array.from(posMap.keys());
    let negMapKeys = Array.from(negMap.keys());
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