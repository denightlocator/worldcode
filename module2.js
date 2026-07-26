var summonedMobs = summonedMobs || {};
var isRolling = isRolling || {};
var rollingResult = rollingResult || {};
var skillStuff = [{name:"Upgrade Effect 1",baseCost:1,max:5},{name:"Upgrade Effect 2",baseCost:1,max:5},{name:"Upgrade Special Item",baseCost:1,max:5}];
var npcMeshIds = npcMeshIds || {};
var npcMeshPos = npcMeshPos || {};
var npcMeshSpawned = npcMeshSpawned || false;
var npcSpawnTries = npcSpawnTries || 0;
var ROLL_CLASS_POS = [0, 10, 0];
var SELECT_CLASS_POS = [2, 10, 0];
var SKILL_NODE_1_POS = [4, 10, 0];
var SKILL_NODE_2_POS = [6, 10, 0];
var SKILL_NODE_3_POS = [8, 10, 0];
var NPC_MESH_SKIN = {head:"trader_black",torso:"trader",arm_left:"trader",arm_right:"trader",leg_left:"trader",leg_right:"trader"};
var getNpcPreset = function(code) {
    code = String(code || "").toLowerCase();
    if (code === "1" || code === "roll" || code === "rollclass" || code === "roll_class") {
        return {name:"Roll Class", subtitle:"Hit to unlock destiny - 1500 Bounty", color:"#FF0000"}; }
    if (code === "2" || code === "select" || code === "selectclass" || code === "select_class") {
        return {name:"Select Class", subtitle:"Hit to cycle owned destinies", color:"#00FFFF"}; }
    if (code === "3" || code === "skill1" || code === "skillnode1") {
        return {name:"Skill Node 1", subtitle:"Upgrade Effect 1", color:"#55FF55"}; }
    if (code === "4" || code === "skill2" || code === "skillnode2") {
        return {name:"Skill Node 2", subtitle:"Upgrade Effect 2", color:"#55FF55"}; }
    if (code === "5" || code === "skill3" || code === "skillnode3") {
        return {name:"Skill Node 3", subtitle:"Upgrade Special Item", color:"#55FF55"}; }
    return null; };
var createNpcMeshAt = function(npcName, pos, subtitle, color) {
    var eId;
    var tag;
    color = color || "cyan";
    if (typeof api.attemptCreateMeshEntity !== "function") {
        api.log("attemptCreateMeshEntity is not available");
        return null; }
    if (!pos || pos.length < 3) {
        api.log("Bad NPC spawn position: " + npcName);
        return null; }
    eId = api.attemptCreateMeshEntity("Person", {size:1, pose:"standing", textures:NPC_MESH_SKIN, autoRotate:false, meshOffset:[0,-0.9,0]}, npcName);
    if (!eId) {
        api.log("Failed to spawn NPC mesh: " + npcName);
        return null; }
    api.setPosition(eId, pos[0], pos[1], pos[2]);
    npcMeshIds[eId] = npcName;
    npcMeshPos[eId] = [pos[0], pos[1], pos[2]];
    try {
        var pids = api.getPlayerIds();
        for (var pi = 0; pi < pids.length; pi++) {
            try { api.setOtherEntitySetting(pids[pi], eId, "canAttack", true); } catch(ignored) {} } } catch(ignored) {}
    tag = {
        content:[{str:npcName,style:{color:color,fontWeight:"bold",fontSize:"70px"}}],
        subtitle:[{str:subtitle || "Hit to interact",style:{color:"white",fontSize:"35px"}}],
        backgroundColor:"#00000000" };
    try {
        var pids2 = api.getPlayerIds();
        for (var pj = 0; pj < pids2.length; pj++) {
            try { api.setOtherEntitySetting(pids2[pj], eId, "nameTagInfo", tag, true); } catch(ignored) {} } } catch(ignored) {
        try { api.setTargetedPlayerSettingForEveryone(eId, "nameTagInfo", tag, true); } catch(ignored2) {} }
    return eId; };
var createHorizonMeshNpc = function(playerId, npcName, subtitle, color) {
    var playerPos = api.getPosition(playerId);
    var eId = createNpcMeshAt(npcName, playerPos, subtitle, color);
    if (eId) msg(playerId, "Spawned mesh NPC: " + npcName, "green");
    else msg(playerId, "Failed to spawn mesh NPC. Check mesh limit or API support.", "red");
    return eId; };
var spawnConfiguredNpcs = function() {
    npcSpawnTries++;
    var ok = 0;
    ok += createNpcMeshAt("Roll Class", ROLL_CLASS_POS, "Hit to unlock destiny - 1500 Bounty", "#FF0000") ? 1 : 0;
    ok += createNpcMeshAt("Select Class", SELECT_CLASS_POS, "Hit to cycle owned destinies", "#00FFFF") ? 1 : 0;
    ok += createNpcMeshAt("Skill Node 1", SKILL_NODE_1_POS, "Upgrade Effect 1", "#55FF55") ? 1 : 0;
    ok += createNpcMeshAt("Skill Node 2", SKILL_NODE_2_POS, "Upgrade Effect 2", "#55FF55") ? 1 : 0;
    ok += createNpcMeshAt("Skill Node 3", SKILL_NODE_3_POS, "Upgrade Special Item", "#55FF55") ? 1 : 0;
    if (ok > 0) npcMeshSpawned = true; };
S.wait(function() {
    if (!npcMeshSpawned) spawnConfiguredNpcs(); }, 20);
var refreshNpcMeshForPlayer = function(playerId) {
    if (!npcMeshIds) return;
    var ids = Object.keys(npcMeshIds);
    for (var idx = 0; idx < ids.length; idx++) {
        try { api.setOtherEntitySetting(playerId, ids[idx], "canAttack", true); } catch(ignored) {} } };
var cmdHandlerHelp = function(id, args, cmd) {
    var pName = api.getEntityName(id);
    var playerStats = getPData(id);
    if (cmd === "!help") {
        if (!args[1]) {
            var helpLines = [
                {str:"--- [ HELP ] ---\n",style:{color:"cyan",fontWeight:"bold"}},
                {str:"!help guild",style:{color:"gold"}},{str:" > Guilds\n",style:{color:"white"}},
                {str:"!help quests",style:{color:"gold"}},{str:" > Progression\n",style:{color:"white"}},
                {str:"!stats",style:{color:"gold"}},{str:" > My Attributes\n",style:{color:"white"}},
                {str:"!top",style:{color:"gold"}},{str:" > Leaderboard\n",style:{color:"white"}},
                {str:"!admins",style:{color:"gold"}},{str:" > Admin Team\n",style:{color:"white"}}
            ];
            if (isAdmin(pName)) helpLines.push({str:"!help admin",style:{color:"#FF4444"}},{str:" > Admin Commands\n",style:{color:"#FF8888"}});
            helpLines.push({str:"----------------------------\n",style:{color:"gray"}},{str:" Earn Bounty by defeating players.\n",style:{color:"Gray"}},{str:" Guild ranks: [L]eader, [CL]Co-Leader, [O]fficer, [V]eteran.",style:{color:"Gray"}});
            api.sendMessage(id, helpLines); } else if (args[1] === "admin") {
            if (!isAdmin(pName)) { msg(id,"Only admins can view admin commands!","red"); return false; }
            api.sendMessage(id,[
                {str:"--- [ ADMIN COMMANDS ] ---\n",style:{color:"#FF4444",fontWeight:"bold"}},
                {str:"!setlevel",style:{color:"cyan"}},{str:" <player> <amount>\n",style:{color:"white"}},
                {str:"!setdestiny",style:{color:"cyan"}},{str:" <player> <class>\n",style:{color:"white"}},
                {str:"!addbounty",style:{color:"cyan"}},{str:" <player> <amount>\n",style:{color:"white"}},
                {str:"!removebounty",style:{color:"cyan"}},{str:" <player> <amount>\n",style:{color:"white"}},
                {str:"!tpa",style:{color:"cyan"}},{str:" <player>\n",style:{color:"white"}},
                {str:"!wipe",style:{color:"cyan"}},{str:" <player>\n",style:{color:"white"}},
                {str:"!spawnnpc",style:{color:"cyan"}},{str:" <1-5> 1=Roll 2=Select 3-5=Skills\n",style:{color:"white"}},
                {str:"!spawnroll",style:{color:"cyan"}},{str:" - Spawn Roll Class mesh NPC\n",style:{color:"white"}},
                {str:"!spawnselect",style:{color:"cyan"}},{str:" - Spawn Select Class mesh NPC\n",style:{color:"white"}},
                {str:"!spawnskill",style:{color:"cyan"}},{str:" <1-3> - Spawn Skill Node mesh NPC\n",style:{color:"white"}},
                {str:"!spawnnpcs",style:{color:"cyan"}},{str:" - Respawn configured mesh NPCs\n",style:{color:"white"}},
                {str:"----------------------------\n",style:{color:"gray"}},
                {str:"Destinies: Warrior, Archer, Mage, Cleric, Rogue, Juggernaut, Reaper",style:{color:"gray"}}
            ]); } else if (args[1] === "guild") {
            api.sendMessage(id,[
                {str:"[ GUILD HELP ]\n",style:{color:"gold",fontWeight:"bold"}},
                {str:"!create <name>\n",style:{color:"cyan"}},
                {str:"!request <name>",style:{color:"cyan"}},{str:" - Join guild\n",style:{color:"white"}},
                {str:"!invite <player>",style:{color:"cyan"}},{str:" - Officer+\n",style:{color:"white"}},
                {str:"!accept <player>",style:{color:"cyan"}},{str:" - Officer+\n",style:{color:"white"}},
                {str:"!accept invite <name>",style:{color:"cyan"}},{str:" - Player\n",style:{color:"white"}},
                {str:"!rank <player> <1-5>",style:{color:"cyan"}},{str:" - Co-Leader+\n",style:{color:"white"}},
                {str:"!ranks",style:{color:"cyan"}},{str:" - View ranks\n",style:{color:"white"}},
                {str:"!disband",style:{color:"cyan"}},{str:" - Leader Only\n",style:{color:"white"}},
                {str:"!leave",style:{color:"cyan"}},{str:" - Quit guild",style:{color:"white"}}
            ]); } else if (args[1] === "quests") {
            api.sendMessage(id,[
                {str:"[ PROGRESSION HELP ]\n",style:{color:"#55ff55",fontWeight:"bold"}},
                {str:"!quest",style:{color:"cyan"}},{str:" - View task\n",style:{color:"white"}},
                {str:"!complete",style:{color:"cyan"}},{str:" - Turn in items\n",style:{color:"white"}},
                {str:"!abandon",style:{color:"cyan"}},{str:" - Skip (Costs 50 bounty)",style:{color:"white"}}
            ]); }
        return false; }
    if (cmd === "!quest") {
        var qIdx = parseInt(playerStats.completed) || 0;
        var questInfo = quests[qIdx % quests.length];
        msg(id,"Current Quest: Collect "+questInfo.amt+"x "+questInfo.item+". Reward: "+questInfo.xp+" XP + 50 Bounty.","#55ff55"); return false; }
    if (cmd === "!abandon") {
        var bountyBal = parseInt(playerStats.bounty) || 0;
        if (bountyBal < 50) { msg(id,"You need 50 Bounty to abandon a quest!","red"); return false; }
        playerStats.bounty = (bountyBal - 50).toString();
        playerStats.completed = ((parseInt(playerStats.completed) || 0) + 1).toString();
        savePData(id, playerStats);
        msg(id,"Quest abandoned! (-50 Bounty). Use !quest to see your new task.","yellow");
        if (typeof sidebar === "function") sidebar(id); return false; }
    if (cmd === "!complete") {
        var qIdx2 = parseInt(playerStats.completed) || 0;
        var questRef = quests[qIdx2 % quests.length];
        var totalFound = 0;
        for (var slotIdx = 0; slotIdx < 44; slotIdx++) {
            var slotItem = api.getItemSlot(id, slotIdx);
            if (slotItem && (slotItem.blockName === questRef.item || slotItem.name === questRef.item)) totalFound += slotItem.amount; }
        if (totalFound >= questRef.amt || (typeof api.getInventoryItemAmount === "function" && api.getInventoryItemAmount(id, questRef.item) >= questRef.amt)) {
            var left = questRef.amt;
            for (var slotIdx2 = 0; slotIdx2 < 44; slotIdx2++) {
                if (left <= 0) break;
                var invItem = api.getItemSlot(id, slotIdx2);
                if (invItem && (invItem.blockName === questRef.item || invItem.name === questRef.item)) {
                    if (invItem.amount <= left) { left -= invItem.amount; api.setItemSlot(id, slotIdx2, "Air"); }
                    else { api.setItemSlot(id, slotIdx2, questRef.item, invItem.amount - left); left = 0; } } }
            playerStats.completed = ((parseInt(playerStats.completed) || 0) + 1).toString();
            var myBounty = (parseInt(playerStats.bounty) || 0) + 50;
            var myXP = (parseInt(playerStats.xp) || 0) + questRef.xp;
            var myLevel = parseInt(playerStats.level) || 1;
            var leveledUp = false;
            var reqXP = myLevel * 300;
            while (myXP >= reqXP && myLevel < 100) { myXP -= reqXP; myLevel++; reqXP = myLevel * 300; leveledUp = true; playerStats.points = ((parseInt(playerStats.points) || 0) + 1).toString(); }
            if (leveledUp) {
                api.broadcastMessage([{icon:"crown",style:{color:"gold"}},{str:" LEVEL UP! ",style:{color:"gold",fontWeight:"bold"}},{str:api.getEntityName(id),style:{color:"#55FFFF"}},{str:"reached Level "+myLevel+"!",style:{color:"#FFFFFF"}}]);
                api.playSound(id,"levelup",1,1); }
            playerStats.bounty = myBounty.toString();
            playerStats.level = myLevel.toString();
            playerStats.xp = myXP.toString();
            savePData(id, playerStats);
            msg(id,"Quest complete! Received "+questRef.xp+" XP and 50 Bounty.","#55ff55");
            api.playSound(id,"pop",1,1);
            if (typeof sidebar === "function") sidebar(id); } else {
            msg(id,"Missing items: "+questRef.amt+"x "+questRef.item+".","red"); }
        return false; }
    if (cmd === "!stats") {
        api.sendMessage(id,[
            {str:"--- [ "+api.getEntityName(id).toUpperCase()+" ] ---\n",style:{color:"cyan",fontWeight:"bold"}},
            {str:"Level: "+playerStats.level+"\n",style:{color:"white"}},
            {str:"Bounty: "+playerStats.bounty+"\n",style:{color:"gold"}},
            {str:"K/D: "+playerStats.kills+"/"+playerStats.deaths+"\n",style:{color:"#ff6666"}},
            {str:"Guild: "+(playerStats.gName||"None"),style:{color:"orange"}}
        ]); return false; }
    if (cmd === "!top") {
        var players = [];
        var pids = api.getPlayerIds();
        for (var ti = 0; ti < pids.length; ti++) {
            var pd = getPData(pids[ti]);
            players.push({name:api.getEntityName(pids[ti]),level:parseInt(pd.level)||1,bounty:parseInt(pd.bounty)||0}); }
        players.sort(function(sortA, sortB) { if(sortB.level!==sortA.level) return sortB.level-sortA.level; return sortB.bounty-sortA.bounty; });
        var topMsg = [{str:"--- [  TOP PLAYERS  ] ---\n",style:{color:"gold",fontWeight:"bold"}}];
        var colors = ["#FFD700","#C0C0C0","#CD7F32"];
        for (var t = 0; t < Math.min(3,players.length); t++) {
            topMsg.push({str:(t+1)+". "+players[t].name+" - Lvl "+players[t].level,style:{color:colors[t]||"white"}});
            topMsg.push({str:"("+players[t].bounty+" Bounty)\n",style:{color:"gold"}}); }
        api.sendMessage(id, topMsg); return false; }
    if (cmd === "!admins") {
        api.sendMessage(id,[
            {str:"--- [ ADMIN TEAM ] ---\n",style:{color:"gold",fontWeight:"bold"}},
            {str:"1. "+adminSlots[0]+"\n",style:{color:"#FFD700"}},
            {str:"2. "+adminSlots[1]+"\n",style:{color:"#FFA500"}},
            {str:"3. "+adminSlots[2]+"\n",style:{color:"#AAAAAA"}}
        ]); return false; } };
var cmdHandlerGuild = function(id, args, cmd) {
    var playerStats = getPData(id);
    if (cmd === "!ranks") {
        api.sendMessage(id,[
            {str:"--- [ GUILD RANKS ] ---\n",style:{color:"gold",fontWeight:"bold"}},
            {str:"[5] Leader - Full control and Disband\n",style:{color:"#FFD700"}},
            {str:"[4] Co-Leader - Promote/Demote up to Officer\n",style:{color:"#FFA500"}},
            {str:"[3] Officer - Invite and Accept members\n",style:{color:"#00FFFF"}},
            {str:"[2] Veteran - Respected member\n",style:{color:"#55FF55"}},
            {str:"[1] Member - Default rank",style:{color:"#FFFFFF"}}
        ]); return false; }
    if (cmd === "!rank") {
        var myRank = parseInt(playerStats.rank) || 0;
        if (myRank < 4) { msg(id,"Only Co-Leaders and Leaders can change ranks!","red"); return false; }
        if (args.length < 3) { msg(id,"Usage: !rank <playerName> <1-5>","red"); return false; }
        var targetName = args[1].toLowerCase();
        var newRank = parseInt(args[2]);
        if (isNaN(newRank) || newRank < 1 || newRank > 5) { msg(id,"Invalid rank! Use !ranks to see numbers 1-5.","red"); return false; }
        if (newRank >= myRank && myRank !== 5) { msg(id,"You can only promote to ranks lower than your own!","red"); return false; }
        var foundId = null, pids = api.getPlayerIds();
        for (var i = 0; i < pids.length; i++) { if (api.getEntityName(pids[i]).toLowerCase() === targetName) { foundId = pids[i]; break; } }
        if (!foundId) { msg(id,"Player not found or not online.","red"); return false; }
        var targetData = getPData(foundId);
        if (!targetData.gName || targetData.gName === "" || targetData.gName === "None" || targetData.gName !== playerStats.gName) { msg(id,"Player is not in your guild!","red"); return false; }
        var theirRank = parseInt(targetData.rank) || 0;
        if (theirRank >= myRank && myRank !== 5) { msg(id,"You cannot change the rank of someone your rank or higher!","red"); return false; }
        if (newRank === 5 && myRank === 5) {
            targetData.rank = "5"; playerStats.rank = "4";
            savePData(id, playerStats); savePData(foundId, targetData);
            bc(api.getEntityName(foundId)+" is now the Leader of "+playerStats.gName+"!","gold"); } else {
            targetData.rank = newRank.toString();
            savePData(foundId, targetData);
            msg(id,"Set "+args[1]+"'s rank to "+newRank+".","green");
            msg(foundId,"Your rank in "+playerStats.gName+" was updated to "+newRank+"!","gold"); }
        if (typeof loadTags === "function") { loadTags(id); loadTags(foundId); }
        return false; }
    if (cmd === "!create") {
        if (playerStats.gName && playerStats.gName !== "" && playerStats.gName !== "None") { msg(id,"You are already in a guild!","red"); return false; }
        var guildName = args.slice(1).join(" ");
        if (!guildName || guildName.length < 3) { msg(id,"Usage: !create <name> (min 3 chars)","red"); return false; }
        if (existingGroups.includes(guildName.toLowerCase())) { msg(id,"Name taken!","red"); return false; }
        playerStats.gType = "Guild"; playerStats.gName = guildName; playerStats.rank = "5";
        savePData(id, playerStats);
        existingGroups.push(guildName.toLowerCase());
        bc(api.getEntityName(id)+" founded the guild: "+guildName+"!","gold","bold");
        if (typeof loadTags === "function") loadTags(id); return false; }
    if (cmd === "!request") {
        if (playerStats.gName && playerStats.gName !== "" && playerStats.gName !== "None") { msg(id,"You are already in a guild.","red"); return false; }
        var reqGuild = args.slice(1).join(" ");
        if (!reqGuild) { msg(id,"Usage: !request <guildName>","red"); return false; }
        if (!existingGroups.includes(reqGuild.toLowerCase())) { msg(id,"That guild does not exist.","red"); return false; }
        if (!requests[reqGuild]) requests[reqGuild] = [];
        var already = false;
        for (var ri = 0; ri < requests[reqGuild].length; ri++) { if (requests[reqGuild][ri].id === id) { already = true; break; } }
        if (already) { msg(id,"Request already pending.","orange"); return false; }
        requests[reqGuild].push({id:id,name:api.getEntityName(id)});
        msg(id,"Request sent to "+reqGuild+".","gold"); return false; }
    if (cmd === "!invite") {
        if (parseInt(playerStats.rank) < 3) { msg(id,"Requires Officer rank (3+).","red"); return false; }
        var inviteTarget = args[1];
        if (!inviteTarget) { msg(id,"Usage: !invite <playerName>","red"); return false; }
        var foundId2 = null, pids2 = api.getPlayerIds();
        for (var i2 = 0; i2 < pids2.length; i2++) { if (api.getEntityName(pids2[i2]).toLowerCase() === inviteTarget.toLowerCase()) { foundId2 = pids2[i2]; break; } }
        if (!foundId2) { msg(id,"Player not found or not online.","red"); return false; }
        var targetData2 = getPData(foundId2);
        if (targetData2.gName && targetData2.gName !== "" && targetData2.gName !== "None") { msg(id,"Player is already in a guild.","red"); return false; }
        invites[foundId2] = invites[foundId2] || [];
        var hasInvite = false;
        for (var ii = 0; ii < invites[foundId2].length; ii++) { if (invites[foundId2][ii] === playerStats.gName) { hasInvite = true; break; } }
        if (!hasInvite) invites[foundId2].push(playerStats.gName);
        msg(foundId2,"You've been invited to "+playerStats.gName+"! Type !accept invite "+playerStats.gName+" to join.","gold");
        msg(id,"Sent invite to "+inviteTarget+".","#55ff55"); return false; }
    if (cmd === "!accept") {
        if (!args[1]) { msg(id,"Usage: !accept <playerName> OR !accept invite <guildName>","red"); return false; }
        if (args[1].toLowerCase() === "invite") {
            var invGuild = args.slice(2).join(" ");
            if (!invGuild) { msg(id,"Usage: !accept invite <guildName>","red"); return false; }
            var myInvites = invites[id] || [];
            var inviteIdx = -1;
            for (var mi = 0; mi < myInvites.length; mi++) { if (myInvites[mi].toLowerCase() === invGuild.toLowerCase()) { inviteIdx = mi; break; } }
            if (inviteIdx === -1) { msg(id,"You do not have a pending invite from "+invGuild+".","red"); return false; }
            if (playerStats.gName && playerStats.gName !== "" && playerStats.gName !== "None") { msg(id,"You are already in a guild! Leave first.","red"); return false; }
            var trueGuildName = myInvites[inviteIdx];
            if (!existingGroups.includes(trueGuildName.toLowerCase())) { msg(id,"That guild no longer exists.","red"); invites[id].splice(inviteIdx,1); return false; }
            playerStats.gType = "Guild"; playerStats.gName = trueGuildName; playerStats.rank = "1";
            savePData(id, playerStats);
            myInvites.splice(inviteIdx,1);
            invites[id] = myInvites;
            msg(id,"You have joined "+trueGuildName+"!","gold");
            bc(api.getEntityName(id)+" has joined the guild "+trueGuildName+"!","gold");
            if (typeof loadTags === "function") loadTags(id); return false; }
        if (parseInt(playerStats.rank) < 3) { msg(id,"Only Officers (3+) can accept join requests.","red"); return false; }
        var acceptName = args[1].toLowerCase();
        var groupReqs = requests[playerStats.gName] || [];
        var reqIdx = -1;
        for (var gi = 0; gi < groupReqs.length; gi++) { if (groupReqs[gi].name.toLowerCase() === acceptName) { reqIdx = gi; break; } }
        if (reqIdx === -1) { msg(id,"No request found from "+args[1]+".","red"); return false; }
        var reqId = groupReqs[reqIdx].id;
        var reqStats = getPData(reqId);
        if (reqStats.gName && reqStats.gName !== "" && reqStats.gName !== "None") { msg(id,"Player is already in a guild.","red"); requests[playerStats.gName].splice(reqIdx,1); return false; }
        reqStats.gType = "Guild"; reqStats.gName = playerStats.gName; reqStats.rank = "1";
        savePData(reqId, reqStats);
        requests[playerStats.gName].splice(reqIdx,1);
        msg(id,"Accepted "+args[1]+" into "+playerStats.gName+"!","#55ff55");
        msg(reqId,"You have been accepted into "+playerStats.gName+"!","gold");
        if (typeof loadTags === "function") loadTags(reqId); return false; }
    if (cmd === "!leave") {
        if (!playerStats.gName || playerStats.gName === "None" || playerStats.gName === "") return false;
        if (parseInt(playerStats.rank) === 5) { msg(id,"Leaders must !disband or promote someone else before leaving.","orange"); return false; }
        msg(id,"You left "+playerStats.gName+".","yellow");
        playerStats.gType = "None"; playerStats.gName = ""; playerStats.rank = "0";
        savePData(id, playerStats);
        if (typeof loadTags === "function") loadTags(id); return false; }
    if (cmd === "!disband") {
        if (parseInt(playerStats.rank) < 5) { msg(id,"Only the Leader can disband!","red"); return false; }
        var disbandName = playerStats.gName;
        var dIdx = existingGroups.indexOf(disbandName.toLowerCase());
        if (dIdx > -1) existingGroups.splice(dIdx, 1);
        var dpids = api.getPlayerIds();
        for (var di = 0; di < dpids.length; di++) {
            var disbandStats = getPData(dpids[di]);
            if (disbandStats.gName === disbandName) { disbandStats.gType = "None"; disbandStats.gName = ""; disbandStats.rank = "0"; savePData(dpids[di], disbandStats); if (typeof loadTags === "function") loadTags(dpids[di]); } }
        bc("The guild "+disbandName+" has been disbanded.","red"); return false; } };
var allCmdHandlers = [cmdHandlerHelp, cmdHandlerGuild];
var dispatchCmd = function(id, args, cmd) {
    var handled = false;
    for (var ci = 0; ci < allCmdHandlers.length; ci++) { if (allCmdHandlers[ci](id, args, cmd) === false) handled = true; }
    return handled; };
playerCommand = function(playerId, message) {
    var args = String(message || "").trim().split(" ");
    var cmd = args[0].toLowerCase();
    return dispatchCmd(playerId, args, cmd) ? false : undefined; };
onPlayerChat = function(id, message) {
    if (message && String(message).startsWith("!")) {
        var args = String(message||"").trim().split(" ");
        var cmd = args[0].toLowerCase();
        dispatchCmd(id, args, cmd); return false; }
    var playerStats = getPData(id);
    var rank = parseInt(playerStats.rank) || 0;
    var colorMap = {purple:"#cc66ff",pink:"#ff80bb",red:"#ff6666",blue:"#66bcff",cyan:"#66ffff",orange:"#ffaa66",yellow:"#ffff66",aqua:"#66ffb3",green:"#66ff66",lime:"#b3ff66"};
    var pColKey = api.getOtherEntitySetting(id, id, "nameColour");
    var pCol = colorMap[pColKey] || "#CEF3FF";
    var isSuper = !!colorMap[pColKey];
    var chatName = api.getEntityName(id);
    var msgArr = [];
    if (isAdmin(chatName)) {
        msgArr.push({str:"[",style:{color:"#FF4444"}},{icon:"shield",style:{color:"#FF4444"}},{str:"ADMIN] ",style:{color:"#FF4444",fontWeight:"bold"}}); }
    if (isSuper) {
        msgArr.push({str:"[",style:{color:"#f2c507"}},{icon:"zap",style:{color:"#f2c507"}},{str:" Super] ",style:{color:"#f2c507"}}); }
    if (playerStats.gName && playerStats.gName !== "" && playerStats.gName !== "None") {
        var gIcon = playerStats.gType === "kingdom" ? "crown" : (playerStats.gType === "cult" ? "chess-rook" : "flag");
        var gColor = typeof getGroupColor === "function" ? getGroupColor(playerStats.gName) : "#ffffff";
        if (rank === 5) msgArr.push({str:"[L] ",style:{color:"gold",fontWeight:"bold"}});
        else if (rank === 4) msgArr.push({str:"[CL] ",style:{color:"#FFA500",fontWeight:"bold"}});
        else if (rank === 3) msgArr.push({str:"[O] ",style:{color:"silver",fontWeight:"bold"}});
        else if (rank === 2) msgArr.push({str:"[V] ",style:{color:"#55FF55",fontWeight:"bold"}});
        msgArr.push({str:"[",style:{color:gColor}},{icon:gIcon,style:{color:gColor}},{str:playerStats.gName+"]",style:{color:gColor}}); }
    msgArr.push({str:chatName+": ",style:{color:pCol,fontWeight:"bold"}},{str:message,style:{color:"white"}});
    api.broadcastMessage(msgArr); return false; };
