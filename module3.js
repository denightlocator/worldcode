// Get a stable display/name value for mob or mesh NPC entities.
var cmdHandlerAdmin = function(id, args, cmd) {
    var pName = api.getEntityName(id);
    if (!isAdmin(pName)) return;
    if (cmd === "!setlevel") {
        if (!args[2]) { msg(id,"Usage: !setlevel <player> <amount>","red"); return false; }
        var tn = args[1].toLowerCase(), tid = null, pids = api.getPlayerIds();
        for (var i = 0; i < pids.length; i++) { if (api.getEntityName(pids[i]).toLowerCase() === tn) { tid = pids[i]; break; } }
        if (!tid) { msg(id,"Player not found or not online.","red"); return false; }
        var setAmt = parseInt(args[2]);
        if (isNaN(setAmt) || setAmt < 1) { msg(id,"Invalid level amount.","red"); return false; }
        var targetData = getPData(tid);
        targetData.level = setAmt.toString();
        savePData(tid, targetData);
        msg(id,"Set "+api.getEntityName(tid)+"'s level to "+setAmt+".","green");
        msg(tid,"Your level was set to "+setAmt+" by an admin.","gold");
        if (typeof sidebar === "function") sidebar(tid);
        if (typeof loadTags === "function") loadTags(tid); return false; }
    if (cmd === "!setdestiny") {
        if (!args[2]) { msg(id,"Usage: !setdestiny <player> <destiny>","red"); return false; }
        var tn2 = args[1].toLowerCase(), tid2 = null, pids2 = api.getPlayerIds();
        for (var i2 = 0; i2 < pids2.length; i2++) { if (api.getEntityName(pids2[i2]).toLowerCase() === tn2) { tid2 = pids2[i2]; break; } }
        if (!tid2) { msg(id,"Player not found or not online.","red"); return false; }
        var className = args.slice(2).join(" "), foundClass = null;
        for (var ci = 0; ci < classes.length; ci++) { if (classes[ci].name.toLowerCase() === className.toLowerCase()) { foundClass = classes[ci]; break; } }
        if (!foundClass) { msg(id,"Unknown destiny! Options: Warrior, Archer, Mage, Cleric, Rogue, Juggernaut, Reaper","red"); return false; }
        var td2 = getPData(tid2);
        var ownedList = (td2.owned === "None" || !td2.owned) ? [] : td2.owned.split(",");
        var alreadyOwns = false;
        for (var oi = 0; oi < ownedList.length; oi++) { if (ownedList[oi].toLowerCase() === foundClass.name.toLowerCase()) { alreadyOwns = true; break; } }
        if (!alreadyOwns) { ownedList.push(foundClass.name); td2.owned = ownedList.join(","); }
        td2.class = foundClass.name;
        savePData(tid2, td2);
        if (typeof applyClassStats === "function") applyClassStats(tid2, foundClass.name);
        if (typeof sidebar === "function") sidebar(tid2);
        if (typeof loadTags === "function") loadTags(tid2);
        msg(id,"Set "+api.getEntityName(tid2)+"'s destiny to "+foundClass.name+".","green");
        msg(tid2,"Your destiny was set to "+foundClass.name+" by an admin!","gold"); return false; }
    if (cmd === "!addbounty") {
        if (!args[2]) { msg(id,"Usage: !addbounty <player> <amount>","red"); return false; }
        var tn3 = args[1].toLowerCase(), tid3 = null, pids3 = api.getPlayerIds();
        for (var i3 = 0; i3 < pids3.length; i3++) { if (api.getEntityName(pids3[i3]).toLowerCase() === tn3) { tid3 = pids3[i3]; break; } }
        if (!tid3) { msg(id,"Player not found or not online.","red"); return false; }
        var addAmt = parseInt(args[2]);
        if (isNaN(addAmt) || addAmt < 1) { msg(id,"Invalid bounty amount.","red"); return false; }
        var td3 = getPData(tid3);
        td3.bounty = ((parseInt(td3.bounty)||0)+addAmt).toString();
        savePData(tid3, td3);
        msg(id,"Added "+addAmt+" bounty to "+api.getEntityName(tid3)+".","green");
        msg(tid3,"An admin added "+addAmt+" Bounty to you!","gold");
        if (typeof sidebar === "function") sidebar(tid3);
        if (typeof loadTags === "function") loadTags(tid3); return false; }
    if (cmd === "!removebounty") {
        if (!args[2]) { msg(id,"Usage: !removebounty <player> <amount>","red"); return false; }
        var tn4 = args[1].toLowerCase(), tid4 = null, pids4 = api.getPlayerIds();
        for (var i4 = 0; i4 < pids4.length; i4++) { if (api.getEntityName(pids4[i4]).toLowerCase() === tn4) { tid4 = pids4[i4]; break; } }
        if (!tid4) { msg(id,"Player not found or not online.","red"); return false; }
        var remAmt = parseInt(args[2]);
        if (isNaN(remAmt) || remAmt < 1) { msg(id,"Invalid bounty amount.","red"); return false; }
        var td4 = getPData(tid4);
        td4.bounty = Math.max(0,(parseInt(td4.bounty)||0)-remAmt).toString();
        savePData(tid4, td4);
        msg(id,"Removed "+remAmt+" bounty from "+api.getEntityName(tid4)+".","green");
        msg(tid4,"An admin removed "+remAmt+" Bounty from you.","gold");
        if (typeof sidebar === "function") sidebar(tid4);
        if (typeof loadTags === "function") loadTags(tid4); return false; }
    if (cmd === "!tpa") {
        if (!args[1]) { msg(id,"Usage: !tpa <player>","red"); return false; }
        var tpaName = args[1].toLowerCase(), tpaId = null, tpaPids = api.getPlayerIds();
        for (var tpaI = 0; tpaI < tpaPids.length; tpaI++) { if (api.getEntityName(tpaPids[tpaI]).toLowerCase() === tpaName) { tpaId = tpaPids[tpaI]; break; } }
        if (!tpaId) { msg(id,"Player not found or not online.","red"); return false; }
        msg(id,"Tped to "+api.getEntityName(tpaId)+".","green");
        api.setPosition(id, api.getPosition(tpaId)); return false; }
    if (cmd === "!wipe") {
        if (!args[1]) { msg(id,"Usage: !wipe <player>","red"); return false; }
        var wipeName = args[1].toLowerCase(), wipeId = null, wipePids = api.getPlayerIds();
        for (var wipeI = 0; wipeI < wipePids.length; wipeI++) { if (api.getEntityName(wipePids[wipeI]).toLowerCase() === wipeName) { wipeId = wipePids[wipeI]; break; } }
        if (!wipeId) { msg(id,"Player not found or not online.","red"); return false; }
        var wipeData = getPData(wipeId);
        if (wipeData.gName && wipeData.gName !== "" && wipeData.gName !== "None") {
            var gn = wipeData.gName;
            if (parseInt(wipeData.rank) === 5) {
                var gidx = existingGroups.indexOf(gn.toLowerCase());
                if (gidx > -1) existingGroups.splice(gidx, 1);
                var dpids = api.getPlayerIds();
                for (var di = 0; di < dpids.length; di++) {
                    var disbandStats = getPData(dpids[di]);
                    if (disbandStats.gName === gn) { disbandStats.gType = "None"; disbandStats.gName = ""; disbandStats.rank = "0"; savePData(dpids[di], disbandStats); if (typeof loadTags === "function") loadTags(dpids[di]); } } } }
        delete requests[wipeData.gName];
        delete invites[wipeId];
        var fresh = defaultPData();
        savePData(wipeId, fresh);
        if (typeof applyClassStats === "function") applyClassStats(wipeId, "None");
        if (typeof sidebar === "function") sidebar(wipeId);
        if (typeof loadTags === "function") loadTags(wipeId);
        msg(id,"Wiped all data for "+api.getEntityName(wipeId)+".","red");
        msg(wipeId,"Your data has been wiped by an admin.","red"); return false; }
    if (cmd === "!spawnnpc") {
        if (!args[1]) {
            msg(id,"Usage: !spawnnpc <1-5>. 1=Roll Class, 2=Select Class, 3-5=Skill Nodes","red"); return false; }
        var preset = getNpcPreset(args[1]);
        var npcNameArg = args.slice(1).join(" ");
        if (preset) {
            createHorizonMeshNpc(id, preset.name, preset.subtitle, preset.color); } else {
            createHorizonMeshNpc(id, npcNameArg, "Interactable NPC", "cyan"); }
        return false; }
    if (cmd === "!spawnroll") {
        createHorizonMeshNpc(id, "Roll Class", "Hit to unlock destiny - 1500 Bounty", "#FF0000"); return false; }
    if (cmd === "!spawnselect") {
        createHorizonMeshNpc(id, "Select Class", "Hit to cycle owned destinies", "#00FFFF"); return false; }
    if (cmd === "!spawnskill") {
        var skillNum = parseInt(args[1]);
        if (isNaN(skillNum) || skillNum < 1 || skillNum > 3) { msg(id,"Usage: !spawnskill <1-3>","red"); return false; }
        createHorizonMeshNpc(id, "Skill Node "+skillNum, skillStuff[skillNum-1].name, "#55FF55"); return false; }
    if (cmd === "!spawnnpcs") {
        spawnConfiguredNpcs();
        msg(id,"Respawned configured mesh NPCs.","green"); return false; } };

if (typeof allCmdHandlers !== 'undefined') { allCmdHandlers.push(cmdHandlerAdmin); }

var getNpcEntityName = function(eId) {
    if (typeof npcMeshIds !== "undefined" && npcMeshIds && npcMeshIds[eId]) return npcMeshIds[eId];
    return api.getEntityName(eId) || "";
};
var findLookedAtNpc = function(playerId) {
    if (typeof npcMeshIds === "undefined" || !npcMeshIds) return null;
    var playerPos = api.getPosition(playerId);
    var facingInfo = api.getPlayerFacingInfo(playerId);
    var facingDir = facingInfo && facingInfo.dir ? facingInfo.dir : null;
    if (!playerPos || !facingDir) return null;
    var bestTarget = null;
    var bestScore = 0.92;
    var meshIds = Object.keys(npcMeshIds);
    for (var idx = 0; idx < meshIds.length; idx++) {
        var meshId = meshIds[idx];
        var npcPos = null;
        if (typeof npcMeshPos !== "undefined" && npcMeshPos && npcMeshPos[meshId]) npcPos = npcMeshPos[meshId];
        else npcPos = api.getPosition(meshId);
        if (!npcPos) continue;
        var diffX = npcPos[0] - playerPos[0];
        var diffY = (npcPos[1] + 1) - (playerPos[1] + 1);
        var diffZ = npcPos[2] - playerPos[2];
        var distance = Math.sqrt(diffX*diffX + diffY*diffY + diffZ*diffZ);
        if (distance < 0.2 || distance > 8) continue;
        var dotProd = (diffX*facingDir[0] + diffY*facingDir[1] + diffZ*facingDir[2]) / distance;
        if (dotProd > bestScore) { bestScore = dotProd; bestTarget = meshId; }
    }
    return bestTarget;
};

// --- Damage handlers (chained) ---
var hitHandlerScythe = function(attacker, victim, damage) {
    if (!attacker || !victim) return;
    var heldItem = api.getHeldItem(attacker);
    var itemName = (heldItem && heldItem.attributes && heldItem.attributes.customDisplayName) || "";
    var attackerData = getPData(attacker);
    if (!attackerData) return;
    if (itemName === "Scythe") {
        var skillArr = (attackerData.skills === "None" || !attackerData.skills) ? [0,0,0] : attackerData.skills.split(",");
        var poisonLvl = 1 + (parseInt(skillArr[2]) || 0);
        api.applyEffect(victim,"Poison",5000,{inbuiltLevel:poisonLvl});
        api.playSound(victim,"hit",1,0.5);
        var victimPos = api.getPosition(victim);
        api.playParticleEffect({dir1:[-1,0,-1],dir2:[1,1,1],pos1:victimPos,pos2:[victimPos[0],victimPos[1]+2,victimPos[2]],texture:"soul_0",minLifeTime:0.5,maxLifeTime:1,minEmitPower:1,maxEmitPower:3,minSize:0.2,maxSize:0.5,manualEmitCount:15,gravity:[0,0.5,0],colorGradients:[{timeFraction:0,minColor:[0,0,0,1],maxColor:[50,50,50,1]}],velocityGradients:[{timeFraction:0,factor:1,factor2:1}],blendMode:1});
    }
    if (attackerData.class === "Warrior") {
        var warriorSkills = (attackerData.skills === "None" || !attackerData.skills) ? [0,0,0] : attackerData.skills.split(",");
        var healChance = 0.1 + ((parseInt(warriorSkills[0]) || 0) * 0.05);
        if (Math.random() < healChance) api.applyEffect(attacker,"Health Regen",2000,{inbuiltLevel:2});
    }
};
var hitHandlerSummon = function(attacker, victim, damage) {
    if (summonedMobs[attacker] === victim) return "preventDamage";
};
var allHitHandlers = [hitHandlerScythe, hitHandlerSummon];
onPlayerDamagingOtherPlayer = function(attacker, victim, damage) {
    var prevent = false;
    for (var hIdx = 0; hIdx < allHitHandlers.length; hIdx++) { if (allHitHandlers[hIdx](attacker, victim, damage) === "preventDamage") prevent = true; }
    return prevent ? "preventDamage" : undefined;
};

// --- Join handlers (chained) ---
var joinHandlerInit = function(playerId) {
    setItemsStats(playerId);
    for (var bIdx = 0; bIdx < CAN_CHANGE.length; bIdx++) api.setCanChangeBlockType(playerId, CAN_CHANGE[bIdx]);
};
var joinHandlerSetup = function(playerId) {
    delay(function() {
        api.setClientOption(playerId,"headerChips",[
            {content:[{str:" Discord",style:{color:"#5865F2",fontWeight:"bold"}}],showBackground:true},
            {content:[{str:"**********albionhorizon",style:{color:"#FFFFFF"}}],showBackground:true},
            {content:[{str:"* Join Now! *",style:{color:"#FFD700",fontWeight:"bold"}}],showBackground:false}
        ]);
        api.setClientOption(playerId,"lobbyLeaderboardInfo",{name:{displayName:"Name",sortPriority:0},level:{displayName:"Lvl",sortPriority:3},guild:{displayName:"Guild",sortPriority:2},bounty:{displayName:"Bounty",sortPriority:1},quests:{displayName:"Quests",sortPriority:0}});
        api.setClientOption(playerId,"touchscreenActionButton",[{str:"Interact",style:{color:"#FFD700",fontWeight:"bold"}}]);
        var slotItem = api.getItemSlot(playerId, 15);
        if (slotItem && slotItem.attributes && (slotItem.attributes.customDisplayName === "* [Player Data - DO NOT MOVE] *" || slotItem.attributes.customDisplayName === "[Player Data]")) api.setItemSlot(playerId, 15, "Air");
        var rawDb = api.getPlayerDbValue(playerId, "AlbionData");
        if (rawDb && rawDb.includes("|")) { dataCache[playerId] = parsePData(rawDb); }
        else { dataCache[playerId] = defaultPData(); savePData(playerId, dataCache[playerId]); }
        if (typeof loadTags === "function") loadTags(playerId);
        if (typeof refreshNpcMeshForPlayer === "function") refreshNpcMeshForPlayer(playerId);
        var playerStats = getPData(playerId);
        if (playerStats && playerStats.class && playerStats.class !== "None" && typeof applyClassStats === "function") applyClassStats(playerId, playerStats.class);
    }, 300);
};
var allJoinHandlers = [joinHandlerInit, joinHandlerSetup];
onPlayerJoin = function(playerId) {
    for (var jIdx = 0; jIdx < allJoinHandlers.length; jIdx++) { allJoinHandlers[jIdx](playerId); }
};

// --- Single-source event handlers ---
onPlayerAltAction = function(playerId, x, y, z, block, targetId) {
    var npcTarget = targetId || findLookedAtNpc(playerId);
    if (npcTarget && getNpcEntityName(npcTarget)) return handleNpcInteraction(playerId, npcTarget, 0, null) || "preventAction";
    var heldItem = api.getHeldItem(playerId);
    if (!heldItem || !heldItem.attributes || !heldItem.attributes.customDisplayName) return;
    var spellName = heldItem.attributes.customDisplayName;
    var spellHandler = spellFns[spellName];
    if (!spellHandler) return;
    var currentEffects = api.getEffects(playerId);
    var nowMs = Date.now();
    if (!clickCounts[playerId]) clickCounts[playerId] = [];
    clickCounts[playerId] = clickCounts[playerId].filter(function(entry) {return nowMs-entry<1000;});
    clickCounts[playerId].push(nowMs);
    if (clickCounts[playerId].length > 20) return;
    var spellPos = api.getPosition(playerId);
    spellHandler(playerId, spellPos[0], spellPos[1], spellPos[2], currentEffects);
};
onPlayerKilledOtherPlayer = function(attacker, victim) {
    if (!victim) return;
    var victimStats = getPData(victim);
    if (victimStats) {
        var victimBounty = parseInt(victimStats.bounty) || 0;
        victimStats.bounty = Math.max(0, victimBounty - 10).toString();
        savePData(victim, victimStats);
        if (typeof sidebar === "function") sidebar(victim);
        if (typeof loadTags === "function") loadTags(victim);
    }
    if (attacker && attacker !== victim) {
        var attackerStats = getPData(attacker);
        if (!attackerStats) return;
        var newKills = (parseInt(attackerStats.kills)||0)+1;
        var currentLevel = parseInt(attackerStats.level)||1;
        var newBounty = (parseInt(attackerStats.bounty)||0)+25;
        var newXp = (parseInt(attackerStats.xp)||0)+50;
        var leveledUp = false;
        var requiredXp = currentLevel * 300;
        while (newXp >= requiredXp && currentLevel < 100) { newXp -= requiredXp; currentLevel++; requiredXp = currentLevel * 300; leveledUp = true; attackerStats.points = ((parseInt(attackerStats.points)||0)+1).toString(); }
        if (leveledUp) {
            api.broadcastMessage([{icon:"crown",style:{color:"gold"}},{str:" LEVEL UP! ",style:{color:"gold",fontWeight:"bold"}},{str:api.getEntityName(attacker),style:{color:"#55FFFF"}},{str:"reached Level "+currentLevel+"!",style:{color:"#FFFFFF"}}]);
            api.playSound(attacker,"levelup",1,1);
        }
        attackerStats.kills = newKills.toString();
        attackerStats.level = currentLevel.toString();
        attackerStats.bounty = newBounty.toString();
        attackerStats.xp = newXp.toString();
        savePData(attacker, attackerStats);
        api.sendMessage(attacker,[{str:"Defeated "+api.getEntityName(victim)+"! ",style:{color:"#FF5555"}},{str:"(+50 XP / +25 Bounty)",style:{color:"#AAAAAA",fontSize:"12px"}}]);
        if (typeof sidebar === "function") sidebar(attacker);
        if (typeof loadTags === "function") loadTags(attacker);
    }
};
onPlayerDie = function(playerId) {
    var deadStats = getPData(playerId);
    deadStats.deaths = ((parseInt(deadStats.deaths)||0)+1).toString();
    savePData(playerId, deadStats);
    if (typeof sidebar === "function") sidebar(playerId);
    if (typeof loadTags === "function") loadTags(playerId);
    var savedClass = deadStats.class;
    delay(function() { if (savedClass && savedClass !== "None" && typeof applyClassStats === "function") applyClassStats(playerId, savedClass); }, 3000);
};
onPlayerChangeBlock = function(playerId, x, y, z, from, to, drop) {
    if (api.getPlayerGamemode(playerId) === "creative") return;
    if (from === "Maple Log") return breakTree(playerId, x, y, z, from);
    if (from === "Messy Stone" || from === "Iron Ore") return breakRockOrOre(playerId, x, y, z, from);
};
tick = function(dt) {
    serverTicks++; tipTimer++; alertTimer++;
    if (typeof spawnConfiguredNpcs === "function" && !npcMeshSpawned && serverTicks % 20 === 0 && (!npcSpawnTries || npcSpawnTries < 20)) {
        spawnConfiguredNpcs();
    }
    if (serverTicks % 5 === 0) {
        var allPlayers = api.getPlayerIds();
        if (allPlayers.length > 0) {
            for (var sIdx = 0; sIdx < 3; sIdx++) {
                var playerOff = (serverTicks + sIdx) % allPlayers.length;
                sidebar(allPlayers[playerOff]);
            }
        }
    }
    if (serverTicks % 100 === 0 && typeof ensureClassEffects === "function") {
        var effectPlayers = api.getPlayerIds();
        for (var eIdx = 0; eIdx < effectPlayers.length; eIdx++) ensureClassEffects(effectPlayers[eIdx]);
    }
    if (serverTicks % 200 === 0 && typeof refreshLobbyBoardForPlayer === "function") {
        var lbPlayers = api.getPlayerIds();
        for (var lbIdx = 0; lbIdx < lbPlayers.length; lbIdx++) refreshLobbyBoardForPlayer(lbPlayers[lbIdx]);
    }
    if (tipTimer >= 7200) {
        if (tips.length > 0) {
            api.broadcastMessage([{str:"[TIP]: ",style:{color:"#FFD700",fontWeight:"bold"}},{str:tips[Math.floor(Math.random()*tips.length)],style:{color:"#FFFFFF"}}]);
        }
        tipTimer = 0;
    }
    if (alertTimer >= 5600) {
        if (alerts.length > 0) {
            api.broadcastMessage([{icon:"shield",style:{color:"#FF5555"}},{str:" [ALBION HORIZON]: ",style:{color:"#FF5555",fontWeight:"bold"}},{str:alerts[Math.floor(Math.random()*alerts.length)],style:{color:"#FFFFFF"}}]);
        }
        alertTimer = 0;
    }
};

var handleNpcInteraction = function(playerId, meshId, dmg, item) {
    var mobName = getNpcEntityName(meshId);
    var playerData = getPData(playerId);
    if (mobName === "Roll Class") {
        if (isRolling[playerId]) return "preventDamage";
        var currentBounty = parseInt(playerData.bounty) || 0;
        if (currentBounty < 1500) { msg(playerId,"You need 1500 Bounty to unlock your destiny!","red"); return "preventDamage"; }
        isRolling[playerId] = true;
        playerData.bounty = (currentBounty - 1500).toString();
        savePData(playerId, playerData);
        if (typeof sidebar === "function") sidebar(playerId);
        if (typeof loadTags === "function") loadTags(playerId);
        var totalWeight = 0;
        for (var wIdx = 0; wIdx < classes.length; wIdx++) totalWeight += classes[wIdx].weight;
        var randomNum = Math.random() * totalWeight, rolled = classes[0];
        for (var cIdx = 0; cIdx < classes.length; cIdx++) { if (randomNum < classes[cIdx].weight) { rolled = classes[cIdx]; break; } randomNum -= classes[cIdx].weight; }
        rollingResult[playerId] = rolled;
        for (var rStep = 0; rStep < 6; rStep++) {
            (function(step) {
                delay(function() {
                    var tempClass = classes[Math.floor(Math.random()*classes.length)];
                    api.playSound(playerId,"bd",1,1);
                    api.setOtherEntitySetting(playerId,meshId,"nameTagInfo",{content:[{str:"Unlocking...",style:{color:"#FFFFFF",fontWeight:"bold",fontSize:"100px"}}],subtitle:[{str:tempClass.name,style:{color:tempClass.color,fontSize:"60px"}}]});
                    if (step === 5) {
                        delay(function() {
                            var finalClass = rollingResult[playerId];
                            api.playSound(playerId,"levelup",1,1);
                            var currentData = getPData(playerId);
                            var ownedList = (currentData.owned === "None" || !currentData.owned) ? [] : currentData.owned.split(",");
                            var isDuplicate = false;
                            for (var oIdx = 0; oIdx < ownedList.length; oIdx++) { if (ownedList[oIdx].toLowerCase() === finalClass.name.toLowerCase()) { isDuplicate = true; break; } }
                            if (isDuplicate) {
                                currentData.bounty = (parseInt(currentData.bounty)+500).toString();
                                msg(playerId,"Duplicate! +500 Bounty returned.","gold");
                            } else {
                                currentData.owned = (currentData.owned === "None" || !currentData.owned) ? finalClass.name : currentData.owned+","+finalClass.name;
                                currentData.class = finalClass.name;
                                msg(playerId,"Unlocked: "+finalClass.name+"!",finalClass.color);
                                if (typeof applyClassStats === "function") applyClassStats(playerId, finalClass.name);
                            }
                            savePData(playerId, currentData);
                            if (typeof sidebar === "function") sidebar(playerId);
                            if (typeof loadTags === "function") loadTags(playerId);
                            isRolling[playerId] = false;
                            api.setOtherEntitySetting(playerId,meshId,"nameTagInfo",{content:[{str:"Unlock Destiny",style:{color:"#FF0000",fontWeight:"bold",fontSize:"100px"}}],subtitle:[{str:"Unlocked: "+finalClass.name,style:{color:finalClass.color,fontSize:"60px"}}]});
                        }, 200);
                    }
                }, step * 200);
            })(rStep);
        }
        return "preventDamage";
    }
    if (mobName === "Select Class") {
        if (playerData.owned === "None" || !playerData.owned) { msg(playerId,"You don't own any destinies yet!","red"); return "preventDamage"; }
        var ownedClasses = playerData.owned.split(",");
        var nextIdx = (ownedClasses.indexOf(playerData.class) + 1) % ownedClasses.length;
        playerData.class = ownedClasses[nextIdx];
        savePData(playerId, playerData);
        if (typeof applyClassStats === "function") applyClassStats(playerId, playerData.class);
        if (typeof sidebar === "function") sidebar(playerId);
        if (typeof loadTags === "function") loadTags(playerId);
        api.playSound(playerId,"pop",1,1);
        msg(playerId,"Switched to: "+playerData.class,"aqua");
        return "preventDamage";
    }
    if (mobName.includes("Skill Node")) {
        var nodeNum = parseInt(mobName.split(" ").pop());
        var nodeIdx = nodeNum - 1;
        var skillNode = skillStuff[nodeIdx];
        var skillLevels = (playerData.skills === "None" || !playerData.skills) ? [0,0,0] : playerData.skills.split(",").map(Number);
        var learnPoints = parseInt(playerData.points) || 0;
        var currentSkillLv = skillLevels[nodeIdx] || 0;
        if (currentSkillLv >= skillNode.max) { msg(playerId,"Skill is MAXED out! (Level "+skillNode.max+")","red"); return "preventDamage"; }
        var upgradeCost = skillNode.baseCost * (currentSkillLv + 1);
        if (learnPoints < upgradeCost) { msg(playerId,"Need "+upgradeCost+" Learning Points! (You have "+learnPoints+")","red"); return "preventDamage"; }
        playerData.points = (learnPoints - upgradeCost).toString();
        skillLevels[nodeIdx] = currentSkillLv + 1;
        playerData.skills = skillLevels.join(",");
        savePData(playerId, playerData);
        if (typeof sidebar === "function") sidebar(playerId);
        if (typeof loadTags === "function") loadTags(playerId);
        api.playSound(playerId,"levelup",1,1.2);
        return "preventDamage";
    }
    return undefined;
};
var npcLastInteract = npcLastInteract || {};
var isNpcInteractName = function(name) {
    return name === "Roll Class" || name === "Select Class" || (name && name.includes("Skill Node"));
};
var interactWithNpc = function(playerId, entityId, dmg, item, fallbackReturn) {
    var entName = getNpcEntityName(entityId);
    if (!isNpcInteractName(entName)) return undefined;
    var nowMs = Date.now();
    var cooldownKey = playerId + "|" + entityId;
    if (npcLastInteract[cooldownKey] && nowMs - npcLastInteract[cooldownKey] < 350) return fallbackReturn;
    npcLastInteract[cooldownKey] = nowMs;
    return handleNpcInteraction(playerId, entityId, dmg || 0, item) || fallbackReturn;
};
onPlayerDamagingMeshEntity = function(playerId, meshId, dmg, item) {
    return interactWithNpc(playerId, meshId, dmg, item, "preventDamage");
};
onPlayerBreakMeshEntity = function(playerId, meshId) {
    return interactWithNpc(playerId, meshId, 0, null, "preventBreak");
};
onPlayerDamagingMob = function(playerId, mobId, dmg, item) {
    return interactWithNpc(playerId, mobId, dmg, item, "preventDamage");
};
onPlayerAttack = function(playerId, targetId) {
    if (targetId) return interactWithNpc(playerId, targetId, 0, null, "preventDamage");
};
onPlayerClick = function(playerId, wasAltClick, x, y, z, block, targetEId) {
    var foundTarget = targetEId;
    var targetInfo;
    if (!foundTarget && typeof api.getPlayerTargetInfo === "function") {
        targetInfo = api.getPlayerTargetInfo(playerId);
        if (targetInfo) foundTarget = targetInfo.entityId || targetInfo.targetEId || targetInfo.eId || targetInfo.entity || targetInfo.damagedId || null;
    }
    if (!foundTarget) foundTarget = findLookedAtNpc(playerId);
    if (foundTarget) return interactWithNpc(playerId, foundTarget, 0, null, "preventAction");
};
onTouchscreenActionButton = function(playerId, touchDown) {
    if (!touchDown) return;
    var foundTarget = findLookedAtNpc(playerId);
    if (foundTarget) return interactWithNpc(playerId, foundTarget, 0, null, "preventAction");
};
