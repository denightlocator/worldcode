// CELL 1: GLOBALS, DISPATCHER, UI
var msg = function(id, s, c, fw) {
    c = c || "white"; fw = fw || "normal";
    return api.sendMessage(id, [{str: s, style: {color: c, fontWeight: fw}}]);
};
var bc = function(s, c, fw) {
    c = c || "white"; fw = fw || "normal";
    return api.broadcastMessage([{str: s, style: {color: c, fontWeight: fw}}]);
};

var adminSlots = ["1tsReallyChewiez", "K4miNoK4mi", "Unknown"];
var adminLookup = {};
for (var ai = 0; ai < adminSlots.length; ai++) adminLookup[adminSlots[ai].toLowerCase()] = true;
var isAdmin = function(name) { return !!adminLookup[name.toLowerCase()]; };

var delay = function(fn, ms) { S.wait(fn, Math.floor(ms/50)); };

var dataCache = dataCache || {};

var defaultPData = function() {
    return {kills:"0",deaths:"0",completed:"0",class:"None",level:"1",points:"0",skills:"0,0,0",bounty:"0",xp:"0",gType:"None",gName:"",rank:"0",owned:"None"};
};

var parsePData = function(raw) {
    var parts = raw.split("|");
    return {kills:parts[0]||"0",deaths:parts[1]||"0",completed:parts[2]||"0",class:parts[3]||"None",level:parts[4]||"1",points:parts[5]||"0",skills:parts[6]||"0,0,0",bounty:parts[7]||"0",xp:parts[8]||"0",gType:parts[9]||"None",gName:parts[10]||"",rank:parts[11]||"0",owned:parts[12]||"None"};
};

var getPData = function(id) {
    if (!dataCache[id]) {
        var dbVal = api.getPlayerDbValue(id, "AlbionData");
        dataCache[id] = (dbVal && dbVal.includes("|")) ? parsePData(dbVal) : defaultPData();
    }
    return dataCache[id];
};

var savePData = function(id, playerData) {
    var str = playerData.kills+"|"+playerData.deaths+"|"+playerData.completed+"|"+playerData.class+"|"+playerData.level+"|"+playerData.points+"|"+playerData.skills+"|"+playerData.bounty+"|"+playerData.xp+"|"+playerData.gType+"|"+playerData.gName+"|"+playerData.rank+"|"+playerData.owned;
    dataCache[id] = playerData;
    api.setPlayerDbValue(id, "AlbionData", str);
};

var existingGroups = existingGroups || [];
var requests = requests || {};
var invites = invites || {};

var getBountyRank = function(bountyAmt) {
    var amt = parseInt(bountyAmt) || 0;
    if (amt >= 10000) return "Legend";
    if (amt >= 5000) return "Master";
    if (amt >= 2500) return "Elite";
    if (amt >= 1000) return "Assassin";
    if (amt >= 500) return "Hunter";
    if (amt >= 100) return "Novice";
    return "Rookie";
};

var quests = [
    {item:"Stone",amt:5,xp:150},{item:"Iron Ore",amt:3,xp:300},{item:"Coal",amt:5,xp:200},
    {item:"Gold Ore",amt:2,xp:400},{item:"Moonstone",amt:1,xp:500}
];

var getBountyColor = function(bountyAmt) {
    var amt = parseInt(bountyAmt) || 0;
    if (amt >= 10000) return "#ff6666";
    if (amt >= 5000) return "#ff80bb";
    if (amt >= 2500) return "#cc66ff";
    if (amt >= 1000) return "#66bcff";
    if (amt >= 500) return "#66ffff";
    if (amt >= 100) return "#b3ff66";
    return "#ffffff";
};

var loadTags = function(playerId) {
    var playerStats = getPData(playerId);
    var bRank = getBountyRank(playerStats.bounty);
    var tagName = api.getEntityName(playerId);
    var contentArr = [];
    contentArr.push({str:"["+bRank+"] ",style:{color:"#FFD700",fontWeight:"bold",fontSize:"38px"}});
    if (isAdmin(tagName)) contentArr.push({str:"[ADMIN] ",style:{color:"#FF4444",fontWeight:"bold",fontSize:"38px"}});
    contentArr.push({str:tagName,style:{color:"#d3e0f5",fontSize:"38px"}});
    contentArr.push({str:" ["+playerStats.kills+" Kills]",style:{color:"#FA8072",fontSize:"38px"}});
    api.setTargetedPlayerSettingForEveryone(playerId,"nameTagInfo",{
        subtitle:[
            {str:"Guild: ",style:{color:"#ffffff"}},{str:playerStats.gName||"None",style:{color:"#40E0D0",fontWeight:"bold"}},
            {str:" | Deaths: ",style:{color:"#FA8072"}},{str:""+playerStats.deaths,style:{color:"#FA8072",fontWeight:"bold"}}
        ],
        content:contentArr
    },true);
    api.setTargetedPlayerSettingForEveryone(playerId,"lobbyLeaderboardValues",{
        level:playerStats.level,guild:playerStats.gName||"None",bounty:playerStats.bounty,quests:playerStats.completed
    },true);
    api.setTargetedPlayerSettingForEveryone(playerId,"colorInLobbyLeaderboard",getBountyColor(playerStats.bounty),true);
    refreshLobbyBoardForPlayer(playerId);
};
var refreshLobbyBoardForPlayer = function(viewerId) {
    var allPids = api.getPlayerIds();
    for (var lbIdx = 0; lbIdx < allPids.length; lbIdx++) {
        var otherPid = allPids[lbIdx];
        var otherStats = getPData(otherPid);
        if (!otherStats) continue;
        api.setOtherEntitySetting(viewerId, otherPid, "lobbyLeaderboardValues", {
            level: otherStats.level,
            guild: otherStats.gName || "None",
            bounty: otherStats.bounty,
            quests: otherStats.completed
        });
        api.setOtherEntitySetting(viewerId, otherPid, "colorInLobbyLeaderboard", getBountyColor(otherStats.bounty));
    }
};

var tips = ["Do !help for help and a f-a-q.","Guilds provide protection! Join a guild with !help guild.","Check your progress anytime with !stats.","Bounty is earned by defeating players.","Unlock destinies at spawn, costs 1500 Bounty!"];
var alerts = ["Albion Horizon Owner flexed god-tier loot!","The Royal Guards are watching.","The Horizon Admin spawned a giant statue.","Punch a mob and it flies 50 blocks. Classic.","HORIZON SUPREMACY","Moonstone vanished? Heretic magic!","The Mists claim another victim...","Lag again? Skill issue?","Beware the Outlands..."];
var tipTimer = 0; var alertTimer = 0; var serverTicks = 0;

var classes = [{name:"Warrior",color:"#FF4500",weight:50},{name:"Archer",color:"#32CD32",weight:45},{name:"Mage",color:"#1E90FF",weight:35},{name:"Cleric",color:"#FFD700",weight:25},{name:"Rogue",color:"#4B0082",weight:20},{name:"Juggernaut",color:"#808080",weight:15},{name:"Reaper",color:"#000000",weight:5}];

var sidebar = function(id) {
    var playerStats = getPData(id);
    var ln = parseInt(playerStats.level) || 1, xn = parseInt(playerStats.xp) || 0, req = ln * 300;
    api.setClientOption(id,"RightInfoText",[
        {str:"       \u2694\ufe0f \ud835\udd38\ud835\udd5d\ud835\udd53\ud835\udd5a\ud835\udd60\ud835\udd5f \u210d\ud835\udd60\ud835\udd63\ud835\udd5a\ud835\udd6b\ud835\udd60\ud835\udd5f \u2694\ufe0f \n",style:{fontSize:"22px",color:"#FFD700",fontWeight:"bold"}},
        {str:"\u2550\u2501\u2550\u2501\u2550\ud802\ude69\u2768\ud83d\udc51\u2769\ud802\ude69\u2550\u2501\u2550\u2501\u2550\n",style:{fontSize:"22px",color:"#F9D71C"}},
        {str:"\ud835\udc73\ud835\udc15\ud835\udc73: "+ln,style:{fontSize:"14px",color:"#FFFFFF"}},{str:xn+"/"+req+"\n",style:{fontSize:"12px",color:"#AAAAAA"}},
        {str:"\u269c\ufe0f Destiny: "+playerStats.class+"\n",style:{fontSize:"14px",color:"#FFFFFF"}},
        {str:"\ud83d\udd78\ufe0fLearning Points: "+playerStats.points+"\n\n",style:{fontSize:"14px",color:"#00FFFF"}},
        {str:"\u2694\ufe0f Kills: "+playerStats.kills,style:{fontSize:"14px",color:"#C7141A"}},{str:" \ud83d\udc80 Deaths: "+playerStats.deaths+"\n",style:{fontSize:"14px",color:"#120303"}},
        {str:"\ud83d\udcb0 Bounty: "+playerStats.bounty+" ["+getBountyRank(playerStats.bounty)+"]\n",style:{fontSize:"14px",color:"#FFD700"}},
        {str:"\ud83d\udee1\ufe0f Guild: "+(playerStats.gName||"None")+"\n",style:{fontSize:"14px",color:"#40E0D0"}},
        {str:"\ud83d\udcdc Completed quests: "+playerStats.completed+"\n",style:{fontSize:"14px",color:"#66ff66"}},
        {str:"\ud83d\udc64 Online: "+api.getPlayerIds().length+"\n",style:{fontSize:"14px",color:"#00FFFF"}},
        {str:"\u2550\u2501\u2550\u2501\u2550\ud802\ude69\u2768\u2727\u2769\ud802\ude69\u2550\u2501\u2550\u2501\u2550\n",style:{fontSize:"22px",color:"#F9D71C"}},
        {str:"\ud83d\udd30 Version 2.1.0 \n",style:{fontSize:"12px",color:"#00FFFF",fontWeight:"bold"}},
        {str:"           \u2501\u2550\u22c6\u2768\ud802\ude69Owner: Horizon\ud802\ude69\u2769\u22c6\u2501\u2550 \n",style:{fontSize:"12px",color:"#FFD700",fontWeight:"bold"}}
    ]);
};

// CELL 2: DESTINY, COMBAT
var CLASS_EFFECT_NAMES = ["Damage","Damage Reduction","Slowness","Haste","Speed","Health Regen","Jump Boost"];
var CLASS_SPECIAL_ITEMS = ["Blue Seeking Paintball Explosive Item","Black Sticky Paintball Explosive Item","Lime Quick Paintball Explosive Item","Purple Paintball Explosive Item"];

var clearClassStatsOnly = function(playerId) {
    for (var ei = 0; ei < CLASS_EFFECT_NAMES.length; ei++) {
        try { api.removeEffect(playerId, CLASS_EFFECT_NAMES[ei]); } catch(ignored) {}
    }
};

var ensureClassEffects = function(playerId) {
    var playerStats = getPData(playerId);
    if (!playerStats || !playerStats.class || playerStats.class === "None") return;
    var className = playerStats.class;
    var skills = (playerStats.skills === "None" || !playerStats.skills) ? [0,0,0] : playerStats.skills.split(",").map(Number);
    var effects = api.getEffects(playerId) || [];
    var hasEffect = function(effectName) { return effects.indexOf(effectName) !== -1; };
    var addEffect = function(effectName, effectLevel) { if (!hasEffect(effectName)) api.applyEffect(playerId, effectName, null, {inbuiltLevel:effectLevel}); };
    if (className === "Juggernaut") {
        addEffect("Damage", 1+(skills[0]||0));
        addEffect("Damage Reduction", 1+(skills[1]||0));
        addEffect("Slowness", 1+(skills[2]||0));
    } else if (className === "Warrior") {
        addEffect("Damage", 1+(skills[0]||0));
        addEffect("Haste", 1+(skills[1]||0));
        addEffect("Speed", 1+(skills[2]||0));
    } else if (className === "Cleric") {
        addEffect("Health Regen", 1+(skills[0]||0));
        addEffect("Damage Reduction", 1+(skills[1]||0));
    } else if (className === "Rogue") {
        addEffect("Speed", 1+(skills[0]||0));
        addEffect("Jump Boost", 1+(skills[1]||0));
    } else if (className === "Mage") {
        addEffect("Jump Boost", 1+(skills[0]||0));
        addEffect("Speed", 1+(skills[1]||0));
    } else if (className === "Archer") {
        addEffect("Damage Reduction", 1+(skills[0]||0));
        addEffect("Damage", 1+(skills[1]||0));
    } else if (className === "Reaper") {
        addEffect("Damage Reduction", 1+(skills[0]||0));
        addEffect("Damage", 1+(skills[1]||0));
    }
};

var applyClassStats = function(playerId, className) {
    clearClassStatsOnly(playerId);
    var abItems = CLASS_SPECIAL_ITEMS;
    for (var aIdx = 0; aIdx < abItems.length; aIdx++) { if (api.getInventoryItemAmount(playerId, abItems[aIdx]) > 0) api.removeItemName(playerId, abItems[aIdx], 1); }
    for (var slotIdx = 0; slotIdx < 44; slotIdx++) { var slotItem = api.getItemSlot(playerId, slotIdx); if (slotItem && slotItem.attributes && slotItem.attributes.customDisplayName === "Scythe") api.setItemSlot(playerId, slotIdx, "Air"); }
    var playerStats = getPData(playerId);
    var skills = (playerStats.skills === "None" || !playerStats.skills) ? [0,0,0] : playerStats.skills.split(",").map(Number);
    api.setTargetedPlayerSettingForEveryone(playerId,"overlayColour",null,false);
    api.updateEntityNodeMeshAttachment(playerId,"TorsoNode","BloxdBlock",{blockName:"null",size:1},[0,0,0],[0,0,0]);
    api.updateEntityNodeMeshAttachment(playerId,"HeadMesh","BloxdBlock",{blockName:"null",size:0.4},[0,1,0],[0,0,0]);
    api.scalePlayerMeshNodes(playerId,{"HeadMesh":[1,1,1],"TorsoNode":[1,1,1],"ArmRightMesh":[1,1,1],"ArmLeftMesh":[1,1,1],"LegLeftMesh":[1,1,1],"LegRightMesh":[1,1,1]});
    if (className === "Juggernaut") {
        api.applyEffect(playerId,"Damage",null,{inbuiltLevel:1+(skills[0]||0)});api.applyEffect(playerId,"Damage Reduction",null,{inbuiltLevel:1+(skills[1]||0)});api.applyEffect(playerId,"Slowness",null,{inbuiltLevel:1+(skills[2]||0)});
        api.updateEntityNodeMeshAttachment(playerId,"HeadMesh","BloxdBlock",{blockName:"Bone Antlers",size:0.4},[0,1,0],[0,0,0]);
        api.scalePlayerMeshNodes(playerId,{"TorsoNode":[1.4,1.4,1.4],"LegLeftMesh":[1.4,1.4,1.4],"LegRightMesh":[1.4,1.4,1.4]});
    } else if (className === "Warrior") {
        api.applyEffect(playerId,"Damage",null,{inbuiltLevel:1+(skills[0]||0)});api.applyEffect(playerId,"Haste",null,{inbuiltLevel:1+(skills[1]||0)});api.applyEffect(playerId,"Speed",null,{inbuiltLevel:1+(skills[2]||0)});
    } else if (className === "Cleric") {
        api.applyEffect(playerId,"Health Regen",null,{inbuiltLevel:1+(skills[0]||0)});api.applyEffect(playerId,"Damage Reduction",null,{inbuiltLevel:1+(skills[1]||0)});
        api.giveItem(playerId,"Lime Quick Paintball Explosive Item",1,{customDisplayName:"Health Burst",customDescription:"Heal nearby allies.",customAttributes:{enchantmentTier:"Tier "+(skills[2]||0)}});
    } else if (className === "Rogue") {
        api.applyEffect(playerId,"Speed",null,{inbuiltLevel:1+(skills[0]||0)});api.applyEffect(playerId,"Jump Boost",null,{inbuiltLevel:1+(skills[1]||0)});
        api.giveItem(playerId,"Black Sticky Paintball Explosive Item",1,{customDisplayName:"Smoke Bomb",customDescription:"Brief Invisibility.",customAttributes:{enchantmentTier:"Tier "+(skills[2]||0)}});
    } else if (className === "Mage") {
        api.applyEffect(playerId,"Jump Boost",null,{inbuiltLevel:1+(skills[0]||0)});api.applyEffect(playerId,"Speed",null,{inbuiltLevel:1+(skills[1]||0)});
        api.giveItem(playerId,"Purple Paintball Explosive Item",1,{customDisplayName:"Frost Nova",customDescription:"Freeze nearby enemies.",customAttributes:{enchantmentTier:"Tier "+(skills[2]||0)}});
    } else if (className === "Archer") {
        api.applyEffect(playerId,"Damage Reduction",null,{inbuiltLevel:1+(skills[0]||0)});api.applyEffect(playerId,"Damage",null,{inbuiltLevel:1+(skills[1]||0)});
        api.giveItem(playerId,"Blue Seeking Paintball Explosive Item",1,{customDisplayName:"Boost Team",customDescription:"Click to boost your guild.",customAttributes:{enchantmentTier:"Tier "+(1+(skills[2]||0))}});
    } else if (className === "Reaper") {
        api.setTargetedPlayerSettingForEveryone(playerId,"overlayColour","#000000",true);
        api.updateEntityNodeMeshAttachment(playerId,"TorsoNode","BloxdBlock",{blockName:"Stone Hoe",size:0.7},[0,0.2,-0.2],[0,0,-0.25]);
        api.applyEffect(playerId,"Damage Reduction",null,{inbuiltLevel:1+(skills[0]||0)});api.applyEffect(playerId,"Damage",null,{inbuiltLevel:1+(skills[1]||0)});
        api.giveItem(playerId,"Stone Hoe",1,{customDisplayName:"Scythe",customDescription:"Use this to rot the player you hit.",customAttributes:{enchantmentTier:"Tier "+(skills[2]||0)}});
    }
};

var clickCounts = clickCounts || {};

var spellFns = {};
spellFns["Voidpiercer Bow"] = function(playerId, px, py, pz, effects) {
    if (effects.includes("voidpiercer_cd")) return;
    api.playSound(playerId,"sweep2",1,1);
    api.applyEffect(playerId,"voidpiercer",3000,{icon:"Diamond Bow",displayName:"Voidpierce On"});
    api.applyEffect(playerId,"voidpiercer_cd",10000,{icon:"Diamond Bow",displayName:"Voidpiercer CD"});
};
spellFns["Necromancer Staff"] = function(playerId, px, py, pz, effects) {
    if (effects.includes("necromancercd")) return;
    api.playSound(playerId,"sweep2",1,1);
    api.applyEffect(playerId,"necromancercd",10000,{icon:"Knight Heart",displayName:"Spawn CD"});
    var mob = api.attemptSpawnMob("Draugr Knight", px, py, pz);
    if (mob) { api.setMobSetting(mob,"ownerDbId",api.getPlayerDbId(playerId)); api.setMobSetting(mob,"name",api.getEntityName(playerId)+"'s Knight"); summonedMobs[mob] = playerId; }
};
spellFns["Enderchain Hook"] = function(playerId, px, py, pz, effects) {
    if (effects.includes("ender_hook_cd")) return;
    var closest = null, minDist = 20;
    var pFacing = api.getPlayerFacingInfo(playerId);
    if (!pFacing || !pFacing.dir) return;
    var facingDir = pFacing.dir;
    var targets = api.getPlayerIds().concat(api.getMobIds());
    for (var idx = 0; idx < targets.length; idx++) {
        var targetId = targets[idx];
        if (targetId === playerId || api.getHealth(targetId) <= 0) continue;
        var tPos = api.getPosition(targetId);
        var dx = tPos[0]-px, dy = tPos[1]-py, dz = tPos[2]-pz;
        var dist = Math.sqrt(dx*dx+dy*dy+dz*dz);
        if (dist < minDist && dist > 0.5) { var dot = (dx*facingDir[0]+dy*facingDir[1]+dz*facingDir[2])/dist; if (dot >= 0.7) { closest = targetId; minDist = dist; } }
    }
    if (closest) {
        var tp = api.getPosition(closest);
        var pullX = px-tp[0], pullY = (py-tp[1])+0.6, pullZ = pz-tp[2];
        var mag = Math.sqrt(pullX*pullX+pullY*pullY+pullZ*pullZ);
        if (mag >= 0.2) {
            api.setVelocity(closest,(pullX/mag)*1.8,(pullY/mag)*1.8,(pullZ/mag)*1.8);
            api.applyHealthChange(closest,-160,playerId);
            api.playSound(playerId,"teleport3",1,1);
            api.applyEffect(playerId,"ender_hook_cd",6000,{icon:"Carbon Rod",displayName:"Hook CD"});
        }
    }
};
spellFns["Boost Team"] = function(playerId, px, py, pz, effects) {
    if (effects.includes("Boost Delay")) { msg(playerId,"Ability is still on cooldown!","red"); return; }
    var playerStats = getPData(playerId);
    if (!playerStats.gName || playerStats.gName === "None" || playerStats.gName === "") { msg(playerId,"You are not in a guild!","red"); return; }
    api.playParticleEffect({dir1:[-1,-1,-1],dir2:[1,1,1],pos1:[px,py+1,pz],pos2:[px+1,py+2,pz+1],texture:"glint",minLifeTime:0.4,maxLifeTime:1,minEmitPower:2,maxEmitPower:4,minSize:0.2,maxSize:0.4,manualEmitCount:35,gravity:[0,-2,0],colorGradients:[{timeFraction:0,minColor:[100,150,255,1],maxColor:[200,220,255,1]}],velocityGradients:[{timeFraction:0,factor:1,factor2:1}],blendMode:1});
    var pids = api.getPlayerIds();
    for (var idx = 0; idx < pids.length; idx++) {
        var teamStats = getPData(pids[idx]);
        if (teamStats.gName === playerStats.gName) {
            var tPos = api.getPosition(pids[idx]);
            var dist = Math.sqrt((px-tPos[0])*(px-tPos[0])+(py-tPos[1])*(py-tPos[1])+(pz-tPos[2])*(pz-tPos[2]));
            if (dist <= 25) { api.applyEffect(pids[idx],"Damage",10000,{inbuiltLevel:2}); api.applyEffect(pids[idx],"Damage Reduction",10000,{inbuiltLevel:2}); api.playSound(pids[idx],"levelup",1,1.5); }
        }
    }
    api.applyEffect(playerId,"Boost Delay",60000,{icon:"Blue Seeking Paintball Explosive Item"});
};
spellFns["Smoke Bomb"] = function(playerId, px, py, pz, effects) {
    if (effects.includes("Smoke Bomb Delay")) { msg(playerId,"Ability is still on cooldown!","red"); return; }
    api.playParticleEffect({dir1:[-1,-1,-1],dir2:[1,1,1],pos1:[px,py+1,pz],pos2:[px+1,py+2,pz+1],texture:"square_particle",minLifeTime:0.6,maxLifeTime:1,minEmitPower:2,maxEmitPower:7,minSize:0.25,maxSize:3,manualEmitCount:100,gravity:[0,-10,0],colorGradients:[{timeFraction:0,minColor:[20,20,20,1],maxColor:[60,60,60,1]}],velocityGradients:[{timeFraction:0,factor:1,factor2:1}],blendMode:1});
    api.applyEffect(playerId,"Invisible",5000,{inbuiltLevel:1});
    api.applyEffect(playerId,"Smoke Bomb Delay",20000,{icon:"Black Sticky Paintball Explosive Item"});
};
spellFns["Health Burst"] = function(playerId, px, py, pz, effects) {
    if (effects.includes("Health Burst Delay")) { msg(playerId,"Ability is still on cooldown!","red"); return; }
    api.playParticleEffect({dir1:[-1,-1,-1],dir2:[1,1,1],pos1:[px,py+1,pz],pos2:[px+1,py+2,pz+1],texture:"glint",minLifeTime:0.3,maxLifeTime:0.7,minEmitPower:3,maxEmitPower:5,minSize:0.3,maxSize:0.6,manualEmitCount:50,gravity:[0,-1,0],colorGradients:[{timeFraction:0,minColor:[50,255,50,1],maxColor:[180,255,180,1]}],velocityGradients:[{timeFraction:0,factor:1,factor2:1}],blendMode:1});
    var pids = api.getPlayerIds();
    for (var idx = 0; idx < pids.length; idx++) {
        var tPos = api.getPosition(pids[idx]);
        var dist = Math.sqrt((px-tPos[0])*(px-tPos[0])+(py-tPos[1])*(py-tPos[1])+(pz-tPos[2])*(pz-tPos[2]));
        if (dist <= 15) { api.applyEffect(pids[idx],"Health Regen",5000,{inbuiltLevel:3}); api.playSound(pids[idx],"pop",1,1); }
    }
    api.applyEffect(playerId,"Health Burst Delay",30000,{icon:"Lime Quick Paintball Explosive Item"});
};
spellFns["Frost Nova"] = function(playerId, px, py, pz, effects) {
    if (effects.includes("Frost Nova Delay")) { msg(playerId,"Ability is still on cooldown!","red"); return; }
    api.playParticleEffect({dir1:[-1,-1,-1],dir2:[1,1,1],pos1:[px-4,py,pz-4],pos2:[px+4,py+3,pz+4],texture:"glint",minLifeTime:0.5,maxLifeTime:1.2,minEmitPower:2,maxEmitPower:5,minSize:0.3,maxSize:0.6,manualEmitCount:60,gravity:[0,-2,0],colorGradients:[{timeFraction:0,minColor:[100,180,255,1],maxColor:[220,240,255,1]},{timeFraction:1,minColor:[50,100,200,0.3],maxColor:[150,200,255,0.3]}],velocityGradients:[{timeFraction:0,factor:1,factor2:1}],blendMode:1});
    api.playSound(playerId,"glass1",1,0.8);
    var spellData = getPData(playerId);
    var mySkills = (spellData.skills === "None" || !spellData.skills) ? [0,0,0] : spellData.skills.split(",").map(Number);
    var slowLevel = 2 + (mySkills[2] || 0);
    var radius = 8 + (mySkills[2] || 0) * 2;
    var pids = api.getPlayerIds();
    for (var idx = 0; idx < pids.length; idx++) {
        if (pids[idx] === playerId) continue;
        var tPos = api.getPosition(pids[idx]);
        var dx = px-tPos[0], dy = py-tPos[1], dz = pz-tPos[2];
        var dist = Math.sqrt(dx*dx+dy*dy+dz*dz);
        if (dist <= radius) {
            api.applyEffect(pids[idx],"Slowness",4000,{inbuiltLevel:slowLevel});
            api.applyHealthChange(pids[idx],-80-(mySkills[2]||0)*20,playerId);
            api.playSound(pids[idx],"glass1",1,1.2);
        }
    }
    var cd = 15000 - (mySkills[2]||0)*1000;
    if (cd < 6000) cd = 6000;
    api.applyEffect(playerId,"Frost Nova Delay",cd,{icon:"Purple Paintball Explosive Item",displayName:"Frost Nova CD"});
};

// CELL 3: GATHERING AND DURABILITY
var ITEMS_STATS = {
    "Wood Sword": {displayName:"Basic Sword",description:{Type:"Weapon",Tier:"1",Rarity:"Common",Value:"15$",Durability:50}},
    "Wood Axe": {displayName:"Basic Axe",ttb:100,description:{Type:"Tool",Tier:"1",Rarity:"Common",Value:"15$",Durability:45}},
    "Wood Pickaxe": {displayName:"Basic Pickaxe",description:{Type:"Tool",Tier:"1",Rarity:"Common",Value:"15$",Durability:50}}
};

var CAN_CHANGE = ["Messy Stone","Maple Log","Iron Ore"];
var RESPAWN_TICKS = {rock:400,ore:800,tree:500};

var setItemsStats = function(id) {
    var itemIds = ["Wood Sword","Wood Axe","Wood Pickaxe"];
    for (var ii = 0; ii < itemIds.length; ii++) {
        var itemId = itemIds[ii];
        var stats = ITEMS_STATS[itemId], descArr = [];
        var statKeys = Object.keys(stats);
        for (var si = 0; si < statKeys.length; si++) {
            var stat = statKeys[si];
            if (stat === "description") {
                var descKeys = Object.keys(stats[stat]);
                for (var di = 0; di < descKeys.length; di++) descArr.push(descKeys[di]+": "+stats[stat][descKeys[di]]+"\n");
                api.setItemStat(id, itemId, "description", descArr);
            } else {
                api.setItemStat(id, itemId, stat, stats[stat]);
            }
        }
    }
};

var giveItem = function(playerId, itemName) {
    var itemInfo = ITEMS_STATS[itemName];
    if (!itemInfo) { msg(playerId,"Unknown item: "+itemName+", pls report this","red"); return; }
    api.giveItem(playerId, itemName, 1, {customAttributes:itemInfo.description});
};

var updateDurability = function(playerId, amount) {
    if (amount === undefined) amount = -1;
    var held = api.getHeldItem(playerId);
    if (!held || !held.attributes || !held.attributes.customAttributes) return;
    var selected = api.getSelectedInventorySlotI(playerId);
    var ca = held.attributes.customAttributes;
    ca.Durability += amount;
    if (ca.Durability <= 0) { api.setItemSlot(playerId, selected, "Air", 0); return; }
    api.setItemSlot(playerId, selected, held.name, held.amount, {customAttributes:ca,customDescription:"Type: "+ca.Type+"\nTier: "+ca.Tier+"\nRarity: "+ca.Rarity+"\nValue: "+ca.Value+"\nDurability: "+ca.Durability});
};

var spawnTree = function(pos, tier) {
    var x=pos[0], y=pos[1]+1, z=pos[2];
    api.setBlockRect([x,y,z],[x,y+1,z],"Maple Log");
    api.setBlockData(x,y,z,{treeTier:tier}); api.setBlockData(x,y+1,z,{treeTier:tier});
    api.setBlockRect([x+1,y+2,z+1],[x-1,y+3,z-1],"Maple Leaves");
    api.setBlockRect([x+1,y+4,z],[x-1,y+5,z],"Maple Leaves");
    api.setBlockRect([x,y+4,z+1],[x,y+5,z-1],"Maple Leaves");
    api.setBlockRect([x,y+6,z],[x,y+7,z],"Maple Leaves");
};

var spawnRock = function(pos, tier, block) {
    var x=pos[0], y=pos[1]+1, z=pos[2];
    api.setBlockRect([x,y,z],[x,y+1,z],block);
    api.setBlockData(x,y,z,{blockTier:tier}); api.setBlockData(x,y+1,z,{blockTier:tier});
    var placed = [];
    while (placed.length < 5) {
        var rx = x+Math.floor(Math.random()*3)-1, rz = z+Math.floor(Math.random()*3)-1;
        if (rx === x && rz === z) continue;
        var key = rx+","+rz;
        var isDup = false; for (var pi = 0; pi < placed.length; pi++) { if (placed[pi] === key) { isDup = true; break; } }
        if (isDup) continue;
        placed.push(key);
        api.setBlock(rx,y,rz,block); api.setBlockData(rx,y,rz,{blockTier:tier});
    }
};

var breakTree = function(playerId, x, y, z, from) {
    var data = api.getBlockData(x, y, z);
    var held = api.getHeldItem(playerId);
    if (!held || !held.attributes || !held.attributes.customAttributes || !data || !data.treeTier) return "preventChange";
    var ca = held.attributes.customAttributes;
    if (data.treeTier <= ca.Tier && ca.Type === "Tool" && held.name.includes("Axe")) {
        var tier = data.treeTier;
        var isTop = api.getBlock(x, y-1, z) === from;
        var baseY = isTop ? y-1 : y;
        api.setBlockRect([x+1,y+1,z+1],[x-1,y+8,z-1],"Air");
        if (isTop) api.setBlock(x,y-1,z,"Air");
        api.setBlock(x,baseY,z,"Bedrock"); api.setBlock(x,baseY+1,z,"Bedrock");
        api.giveItem(playerId, from, 18);
        updateDurability(playerId);
        delay(function() {
            spawnTree([x,baseY-1,z],tier);
            api.setBlockData(x,baseY,z,{treeTier:tier}); api.setBlockData(x,baseY+1,z,{treeTier:tier});
        }, RESPAWN_TICKS.tree * 50);
        return "preventDrop";
    }
    return "preventChange";
};

var breakRockOrOre = function(playerId, x, y, z, from) {
    var data = api.getBlockData(x, y, z);
    var held = api.getHeldItem(playerId);
    if (!held || !held.attributes || !held.attributes.customAttributes || !data || data.blockTier === undefined) return "preventChange";
    var ca = held.attributes.customAttributes;
    if (data.blockTier <= ca.Tier && ca.Type === "Tool" && held.name.includes("Pickaxe")) {
        api.giveItem(playerId, from, Math.round(Math.random()*3)+1);
        updateDurability(playerId);
        var tier = data.blockTier;
        api.setBlock(x,y,z,"Bedrock");
        var ticks = from === "Iron Ore" ? RESPAWN_TICKS.ore : RESPAWN_TICKS.rock;
        delay(function() { api.setBlock(x,y,z,from); api.setBlockData(x,y,z,{blockTier:tier}); }, ticks * 50);
        return "preventDrop";
    }
    return "preventChange";
};
