'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trash2, Target, ClipboardList, BarChart3, Database, Zap, Upload, Download, Search, Share2, FileText, Copy, Check, Link, Timer, Eye } from 'lucide-react';

export default function GraniteHillsScoutApp() {
  const [activeTab, setActiveTab] = useState('pitch');
  const [pitchLog, setPitchLog] = useState([]);
  const [currentInning, setCurrentInning] = useState(1);
  const [currentBatter, setCurrentBatter] = useState('');
  const [balls, setBalls] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [outs, setOuts] = useState(0);
  const [runners, setRunners] = useState({ first: false, second: false, third: false });
  const [gameInfo, setGameInfo] = useState({
    id: Date.now().toString(),
    opponent: '',
    pitcherName: '',
    pitcherNumber: '',
    pitcherThrows: 'R',
    date: new Date().toISOString().split('T')[0],
    gameType: 'Regular Season'
  });
  const [pitcherNotes, setPitcherNotes] = useState({
    fastballVelo: '',
    outPitch: '',
    firstPitchTendency: '',
    tipping: '',
    weakness: ''
  });
  const [pickMove, setPickMove] = useState({
    type: '',
    holdTime: '',
    tellNotes: '',
    distanceNotes: '',
    pickoffAttempts: 0,
    pickoffSuccess: 0
  });
  const [selectedZone, setSelectedZone] = useState(null);
  const [zoneData, setZoneData] = useState({});
  
  const [savedGames, setSavedGames] = useState([]);
  const [savedPitchers, setSavedPitchers] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [copied, setCopied] = useState(false);

  const pickMoveTypes = [
    { name: 'CHUCK', color: 'bg-red-500', type: 'Set & Go', timing: 'Immediate', strategy: 'Fires immediately. Be ready to go instantly.', icon: '⏱️' },
    { name: 'CELO', color: 'bg-teal-500', type: 'Breath', timing: 'Watch breath', strategy: 'Takes a breath. Use his breath (slow or quick) as your trigger.', icon: '🌬️' },
    { name: 'ACE', color: 'bg-amber-500', type: '1 Count', timing: '~1 sec', strategy: 'Holds for ~1 sec. Start movement almost immediately after set.', icon: '1️⃣' },
    { name: 'JETER', color: 'bg-green-500', type: '2 Count', timing: '~2 secs', strategy: 'Holds for ~2 secs. Start movement around the 1-count mark.', icon: '2️⃣' },
    { name: 'BAMBINO', color: 'bg-orange-500', type: '3 Count', timing: '~3 secs', strategy: 'Holds for ~3 secs. Delay your movement.', icon: '3️⃣' },
    { name: 'LOU', color: 'bg-purple-500', type: '4 Count', timing: '~4 secs', strategy: 'Holds for ~4 secs. Be patient; start moving around count 2 or 3.', icon: '4️⃣' }
  ];

  useEffect(() => {
    loadFromStorage();
  }, []);

  const loadFromStorage = () => {
    try {
      const games = localStorage.getItem('granite_hills_games');
      const pitchers = localStorage.getItem('granite_hills_pitchers');
      if (games) setSavedGames(JSON.parse(games) || []);
      if (pitchers) setSavedPitchers(JSON.parse(pitchers) || []);
    } catch (e) {
      setSavedGames([]);
      setSavedPitchers([]);
    }
  };

  const saveToStorage = (games, pitchers) => {
    try {
      localStorage.setItem('granite_hills_games', JSON.stringify(games));
      localStorage.setItem('granite_hills_pitchers', JSON.stringify(pitchers));
      return true;
    } catch (e) {
      return false;
    }
  };

  const calculateGameStats = () => {
    const totalPitches = pitchLog.length;
    const strikesCount = pitchLog.filter(p => ['S', 'F', 'K', 'IP'].includes(p.result)).length;
    const pitchCounts = {};
    pitchTypes.forEach(pt => {
      const count = pitchLog.filter(p => p.pitch === pt.name).length;
      if (count > 0) pitchCounts[pt.name] = { count, percentage: Math.round((count / totalPitches) * 100) };
    });
    return {
      totalPitches,
      strikes: strikesCount,
      strikePercentage: totalPitches > 0 ? Math.round((strikesCount / totalPitches) * 100) : 0,
      pitchCounts
    };
  };

  const saveCurrentGame = async () => {
    if (!gameInfo.opponent || !gameInfo.pitcherName) {
      alert('Please enter opponent and pitcher name before saving.');
      return;
    }
    setIsSaving(true);
    
    const gameData = {
      id: gameInfo.id,
      opponent: gameInfo.opponent,
      pitcherName: gameInfo.pitcherName,
      pitcherNumber: gameInfo.pitcherNumber,
      pitcherThrows: gameInfo.pitcherThrows,
      date: gameInfo.date,
      gameType: gameInfo.gameType,
      pitchLog,
      zoneData,
      notes: pitcherNotes,
      pickMove,
      stats: calculateGameStats(),
      savedAt: new Date().toISOString()
    };

    const existingIndex = savedGames.findIndex(g => g.id === gameInfo.id);
    let updatedGames = existingIndex >= 0 
      ? savedGames.map((g, i) => i === existingIndex ? gameData : g)
      : [...savedGames, gameData];

    const existingPitcher = savedPitchers.find(p => 
      p.name.toLowerCase() === gameInfo.pitcherName.toLowerCase() && 
      p.team.toLowerCase() === gameInfo.opponent.toLowerCase()
    );

    let updatedPitchers;
    if (existingPitcher) {
      updatedPitchers = savedPitchers.map(p => {
        if (p.name.toLowerCase() === gameInfo.pitcherName.toLowerCase() && 
            p.team.toLowerCase() === gameInfo.opponent.toLowerCase()) {
          return { ...p, games: [...p.games.filter(g => g.id !== gameInfo.id), { id: gameInfo.id, date: gameInfo.date }], lastSeen: gameInfo.date, throws: gameInfo.pitcherThrows, number: gameInfo.pitcherNumber || p.number, pickMove: pickMove.type };
        }
        return p;
      });
    } else {
      updatedPitchers = [...savedPitchers, {
        id: Date.now().toString(),
        name: gameInfo.pitcherName,
        number: gameInfo.pitcherNumber,
        team: gameInfo.opponent,
        throws: gameInfo.pitcherThrows,
        games: [{ id: gameInfo.id, date: gameInfo.date }],
        lastSeen: gameInfo.date,
        pickMove: pickMove.type
      }];
    }

    const success = saveToStorage(updatedGames, updatedPitchers);
    if (success) {
      setSavedGames(updatedGames);
      setSavedPitchers(updatedPitchers);
      setLastSaved(new Date().toLocaleTimeString());
      setShowSaveModal(false);
    }
    setIsSaving(false);
  };

  const loadGame = (game) => {
    setGameInfo({ id: game.id, opponent: game.opponent, pitcherName: game.pitcherName, pitcherNumber: game.pitcherNumber || '', pitcherThrows: game.pitcherThrows, date: game.date, gameType: game.gameType || 'Regular Season' });
    setPitchLog(game.pitchLog || []);
    setZoneData(game.zoneData || {});
    setPitcherNotes(game.notes || { fastballVelo: '', outPitch: '', firstPitchTendency: '', tipping: '', weakness: '' });
    setPickMove(game.pickMove || { type: '', holdTime: '', tellNotes: '', distanceNotes: '', pickoffAttempts: 0, pickoffSuccess: 0 });
    setShowLoadModal(false);
    setActiveTab('pitch');
  };

  const deleteGame = (gameId) => {
    if (!confirm('Delete this scouting report?')) return;
    const updatedGames = savedGames.filter(g => g.id !== gameId);
    saveToStorage(updatedGames, savedPitchers);
    setSavedGames(updatedGames);
  };

  const startNewGame = () => {
    if (pitchLog.length > 0 && !confirm('Start a new game? Unsaved data will be lost.')) return;
    setGameInfo({ id: Date.now().toString(), opponent: '', pitcherName: '', pitcherNumber: '', pitcherThrows: 'R', date: new Date().toISOString().split('T')[0], gameType: 'Regular Season' });
    setPitchLog([]);
    setZoneData({});
    setPitcherNotes({ fastballVelo: '', outPitch: '', firstPitchTendency: '', tipping: '', weakness: '' });
    setPickMove({ type: '', holdTime: '', tellNotes: '', distanceNotes: '', pickoffAttempts: 0, pickoffSuccess: 0 });
    resetCount();
    setOuts(0);
    setCurrentInning(1);
    setLastSaved(null);
  };

  const generateTextSummary = () => {
    const stats = calculateGameStats();
    const moveType = pickMoveTypes.find(m => m.name === pickMove.type);
    
    let text = `🦅 GRANITE HILLS SCOUTING REPORT\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📅 ${gameInfo.date}\n`;
    text += `🆚 vs ${gameInfo.opponent}\n\n`;
    text += `⚾ PITCHER: ${gameInfo.pitcherName}`;
    if (gameInfo.pitcherNumber) text += ` #${gameInfo.pitcherNumber}`;
    text += ` (${gameInfo.pitcherThrows === 'R' ? 'RHP' : 'LHP'})\n\n`;
    
    if (pickMove.type) {
      text += `🏃 STEAL CALL: ${pickMove.type}\n`;
      text += `⏱️ ${moveType?.type} (${moveType?.timing})\n`;
      text += `📋 ${moveType?.strategy}\n`;
      if (pickMove.tellNotes) text += `👀 Tell: ${pickMove.tellNotes}\n`;
      if (pickMove.distanceNotes) text += `📏 Distance: ${pickMove.distanceNotes}\n`;
      text += `\n`;
    }
    
    text += `📊 PITCH TOTALS: ${stats.totalPitches} pitches (${stats.strikePercentage}% strikes)\n\n`;
    
    text += `🎯 PITCH MIX\n`;
    pitchTypes.forEach(pt => {
      const count = pitchLog.filter(p => p.pitch === pt.name).length;
      if (count > 0) {
        const pct = Math.round((count / stats.totalPitches) * 100);
        text += `${pt.label}: ${count} (${pct}%)\n`;
      }
    });
    
    if (pitcherNotes.fastballVelo) text += `\n🔥 FB Velo: ${pitcherNotes.fastballVelo}`;
    if (pitcherNotes.outPitch) text += `\n💀 Out Pitch: ${pitcherNotes.outPitch}`;
    if (pitcherNotes.firstPitchTendency) text += `\n1️⃣ First Pitch: ${pitcherNotes.firstPitchTendency}`;
    if (pitcherNotes.weakness) text += `\n\n⚠️ WEAKNESS: ${pitcherNotes.weakness}`;
    
    text += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `GO EAGLES! 🦅`;
    
    return text;
  };

  const generateImportCode = () => {
    const data = { g: gameInfo, p: pitchLog, z: zoneData, n: pitcherNotes, m: pickMove };
    return btoa(JSON.stringify(data));
  };

  const importFromCode = (code) => {
    try {
      const data = JSON.parse(atob(code));
      setGameInfo({ ...data.g, id: Date.now().toString() });
      setPitchLog(data.p || []);
      setZoneData(data.z || {});
      setPitcherNotes(data.n || {});
      setPickMove(data.m || { type: '', holdTime: '', tellNotes: '', distanceNotes: '', pickoffAttempts: 0, pickoffSuccess: 0 });
      return true;
    } catch (e) {
      alert('Invalid import code');
      return false;
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const nativeShare = async () => {
    const text = generateTextSummary();
    if (navigator.share) {
      try { await navigator.share({ title: `Scouting Report: ${gameInfo.pitcherName}`, text }); } 
      catch (e) { copyToClipboard(text); }
    } else { copyToClipboard(text); }
  };

  const pitchTypes = [
    { name: 'FB', label: 'Fastball', color: 'bg-red-500' },
    { name: 'CB', label: 'Curve', color: 'bg-sky-400' },
    { name: 'SL', label: 'Slider', color: 'bg-green-500' },
    { name: 'CH', label: 'Change', color: 'bg-yellow-500' },
    { name: 'CT', label: 'Cutter', color: 'bg-purple-500' },
    { name: '2S', label: '2-Seam', color: 'bg-orange-500' }
  ];

  const results = [
    { name: 'S', label: 'Strike', type: 'strike' },
    { name: 'B', label: 'Ball', type: 'ball' },
    { name: 'F', label: 'Foul', type: 'strike' },
    { name: 'IP', label: 'In Play', type: 'end' },
    { name: 'K', label: 'Strikeout', type: 'out' },
    { name: 'BB', label: 'Walk', type: 'end' }
  ];

  const logPitch = (pitchType, result, zone = null) => {
    const pitch = { id: Date.now(), inning: currentInning, batter: currentBatter || `Batter ${pitchLog.length + 1}`, count: `${balls}-${strikes}`, pitch: pitchType, result, zone, timestamp: new Date().toLocaleTimeString() };
    setPitchLog([...pitchLog, pitch]);
    if (zone) setZoneData(prev => ({ ...prev, [zone]: [...(prev[zone] || []), { pitch: pitchType, result }] }));

    const resultObj = results.find(r => r.name === result);
    if (resultObj?.type === 'strike' && strikes < 2) setStrikes(strikes + 1);
    else if (resultObj?.type === 'ball' && balls < 3) setBalls(balls + 1);
    else if (resultObj?.type === 'out' || resultObj?.type === 'end') { resetCount(); if (resultObj?.type === 'out') setOuts(prev => prev < 2 ? prev + 1 : 0); }
    else if (strikes === 2 && resultObj?.type === 'strike' && result !== 'F') { resetCount(); setOuts(prev => prev < 2 ? prev + 1 : 0); }
    else if (balls === 3 && resultObj?.type === 'ball') resetCount();
  };

  const resetCount = () => { setBalls(0); setStrikes(0); setCurrentBatter(''); };
  const deletePitch = (id) => setPitchLog(pitchLog.filter(p => p.id !== id));

  const getPitchStats = () => {
    const stats = {};
    pitchTypes.forEach(pt => {
      const pitches = pitchLog.filter(p => p.pitch === pt.name);
      const strikesHit = pitches.filter(p => ['S', 'F', 'K', 'IP'].includes(p.result)).length;
      stats[pt.name] = { count: pitches.length, strikeRate: pitches.length > 0 ? Math.round((strikesHit / pitches.length) * 100) : 0 };
    });
    return stats;
  };

  const getCountStats = () => {
    const counts = {};
    pitchLog.forEach(p => { if (!counts[p.count]) counts[p.count] = {}; if (!counts[p.count][p.pitch]) counts[p.count][p.pitch] = 0; counts[p.count][p.pitch]++; });
    return counts;
  };

  const getUniqueTeams = () => Array.from(new Set(savedGames.map(g => g.opponent))).sort();
  const getFilteredGames = () => savedGames.filter(game => (searchTerm === '' || game.pitcherName.toLowerCase().includes(searchTerm.toLowerCase()) || game.opponent.toLowerCase().includes(searchTerm.toLowerCase())) && (filterTeam === '' || game.opponent === filterTeam)).sort((a, b) => new Date(b.date) - new Date(a.date));
  const getPitcherHistory = (name, team) => savedGames.filter(g => g.pitcherName.toLowerCase() === name.toLowerCase() && g.opponent.toLowerCase() === team.toLowerCase()).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Navy: #1e3a5f, Columbia: #9bcbeb
  const Header = () => (
    <div className="bg-[#1e3a5f] text-white px-4 py-4 safe-top">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#9bcbeb]">
            {gameInfo.pitcherName || 'No Pitcher'} 
            {gameInfo.pitcherNumber && <span className="text-white"> #{gameInfo.pitcherNumber}</span>}
          </h1>
          <p className="text-sm text-white">
            {gameInfo.opponent ? `vs ${gameInfo.opponent}` : 'Set opponent in Data tab'} 
            {gameInfo.pitcherThrows && <span className="text-[#9bcbeb]"> • {gameInfo.pitcherThrows === 'R' ? 'RHP' : 'LHP'}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pickMove.type && (
            <div className={`${pickMoveTypes.find(m => m.name === pickMove.type)?.color} px-3 py-1.5 rounded text-sm font-bold`}>
              {pickMove.type}
            </div>
          )}
          <button onClick={() => setShowShareModal(true)} className="bg-[#2d4a6f] p-2 rounded-lg">
            <Share2 size={20} className="text-[#9bcbeb]" />
          </button>
        </div>
      </div>
    </div>
  );

  const PickMoveView = () => {
    const selectedMove = pickMoveTypes.find(m => m.name === pickMove.type);
    
    return (
      <div className="flex flex-col h-full bg-slate-100 overflow-auto">
        <div className="bg-[#2d4a6f] px-4 py-2 text-white text-sm font-bold flex items-center gap-2">
          <Timer size={16} /> PICK MOVE / STEAL CALL
        </div>

        {pickMove.type && (
          <div className={`${selectedMove?.color} px-4 py-3 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{pickMove.type}</p>
                <p className="text-sm opacity-90">{selectedMove?.type} • {selectedMove?.timing}</p>
              </div>
              <div className="text-4xl">{selectedMove?.icon}</div>
            </div>
            <p className="text-sm mt-2 opacity-90">{selectedMove?.strategy}</p>
          </div>
        )}

        <div className="p-3">
          <p className="text-xs font-bold text-slate-500 mb-2">SELECT MOVE TYPE</p>
          <div className="grid grid-cols-3 gap-2">
            {pickMoveTypes.map(move => (
              <button
                key={move.name}
                onClick={() => setPickMove({ ...pickMove, type: move.name })}
                className={`p-3 rounded-xl text-white font-bold transition-all ${move.color} ${pickMove.type === move.name ? 'ring-4 ring-offset-2 ring-[#1e3a5f] scale-105' : 'opacity-80'}`}
              >
                <div className="text-2xl mb-1">{move.icon}</div>
                <div className="text-sm">{move.name}</div>
                <div className="text-xs opacity-80">{move.timing}</div>
              </button>
            ))}
          </div>
        </div>

        {pickMove.type && (
          <div className="px-3 pb-3 space-y-3">
            <div className="bg-white rounded-xl p-4">
              <p className="text-xs font-bold text-slate-500 mb-2">STRATEGY</p>
              <p className="text-sm text-slate-700">{selectedMove?.strategy}</p>
            </div>

            <div className="bg-white rounded-xl p-4">
              <label className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                <Eye size={14} /> THE TELL (What tips it off?)
              </label>
              <textarea
                placeholder="e.g., Looks at runner before quick move, shoulder dips..."
                value={pickMove.tellNotes}
                onChange={(e) => setPickMove({ ...pickMove, tellNotes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-20 mt-2"
              />
            </div>

            <div className="bg-white rounded-xl p-4">
              <label className="text-xs font-bold text-slate-500 mb-2">📏 DISTANCE NOTES</label>
              <textarea
                placeholder="e.g., Can get big lead, slow to plate..."
                value={pickMove.distanceNotes}
                onChange={(e) => setPickMove({ ...pickMove, distanceNotes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-20 mt-2"
              />
            </div>

            <div className="bg-white rounded-xl p-4">
              <p className="text-xs font-bold text-slate-500 mb-3">PICKOFF ATTEMPTS</p>
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1">Attempts</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPickMove({ ...pickMove, pickoffAttempts: Math.max(0, pickMove.pickoffAttempts - 1) })} className="w-10 h-10 bg-slate-200 rounded-lg font-bold text-xl">-</button>
                    <span className="text-2xl font-bold w-12 text-center">{pickMove.pickoffAttempts}</span>
                    <button onClick={() => setPickMove({ ...pickMove, pickoffAttempts: pickMove.pickoffAttempts + 1 })} className="w-10 h-10 bg-slate-200 rounded-lg font-bold text-xl">+</button>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1">Got Runner</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPickMove({ ...pickMove, pickoffSuccess: Math.max(0, pickMove.pickoffSuccess - 1) })} className="w-10 h-10 bg-slate-200 rounded-lg font-bold text-xl">-</button>
                    <span className="text-2xl font-bold w-12 text-center">{pickMove.pickoffSuccess}</span>
                    <button onClick={() => setPickMove({ ...pickMove, pickoffSuccess: pickMove.pickoffSuccess + 1 })} className="w-10 h-10 bg-red-500 text-white rounded-lg font-bold text-xl">+</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#e8f4fc] rounded-xl p-4 border border-[#9bcbeb]">
              <p className="text-sm font-bold text-[#1e3a5f] mb-2">🔑 KEYS TO EXECUTION</p>
              <div className="space-y-2 text-xs text-[#2d4a6f]">
                <p><strong>Find "The Spot":</strong> Know your specific distance goal</p>
                <p><strong>Know "The Tell":</strong> Look for patterns in his move</p>
                <p><strong>Distance Control:</strong> Pitcher's move dictates your lead</p>
              </div>
            </div>
          </div>
        )}

        {!pickMove.type && (
          <div className="flex-1 flex items-center justify-center text-slate-400 p-8 text-center">
            <div>
              <Timer size={48} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">Select a move type above</p>
              <p className="text-sm">Watch the pitcher with runners on and identify his timing pattern</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ShareModal = () => {
    const [importCode, setImportCode] = useState('');
    if (!showShareModal) return null;

    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
        <div className="bg-[#1e3a5f] text-white px-4 py-3 flex items-center justify-between safe-top">
          <h2 className="font-bold flex items-center gap-2"><Share2 size={18} /> Share Report</h2>
          <button onClick={() => setShowShareModal(false)} className="text-slate-300 text-xl">✕</button>
        </div>
        <div className="flex-1 overflow-auto bg-slate-100 p-4 space-y-4">
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-bold text-slate-700 mb-3">📱 Quick Share</h3>
            <button onClick={nativeShare} className="w-full bg-[#1e3a5f] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
              <Share2 size={18} /> Share Report
            </button>
          </div>
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-bold text-slate-700 mb-3"><FileText size={18} className="inline mr-2" />Text Summary</h3>
            <div className="bg-slate-100 rounded-lg p-3 text-xs font-mono max-h-40 overflow-auto whitespace-pre-wrap mb-3">{generateTextSummary()}</div>
            <button onClick={() => copyToClipboard(generateTextSummary())} className="w-full bg-[#2d4a6f] text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2">
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-bold text-slate-700 mb-3"><Link size={18} className="inline mr-2" />Transfer Code</h3>
            <p className="text-xs text-slate-500 mb-3">Share this code with another coach to transfer the full report</p>
            <button onClick={() => copyToClipboard(generateImportCode())} className="w-full bg-[#9bcbeb] text-[#1e3a5f] py-2 rounded-lg font-bold text-sm">Copy Transfer Code</button>
          </div>
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-bold text-slate-700 mb-3"><Download size={18} className="inline mr-2" />Import Report</h3>
            <textarea placeholder="Paste transfer code here..." value={importCode} onChange={(e) => setImportCode(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono h-20 mb-3" />
            <button onClick={() => { if (importFromCode(importCode)) { setShowShareModal(false); setImportCode(''); } }} disabled={!importCode} className="w-full bg-green-500 text-white py-2 rounded-lg font-bold text-sm disabled:bg-slate-300">Import Report</button>
          </div>
        </div>
      </div>
    );
  };

  const SaveModal = () => {
    if (!showSaveModal) return null;
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
          <div className="bg-[#1e3a5f] text-white px-4 py-3"><h2 className="font-bold flex items-center gap-2"><Upload size={18} /> Save Report</h2></div>
          <div className="p-4 space-y-3">
            <div className="bg-slate-100 rounded-lg p-3"><p className="text-xs text-slate-500">Opponent</p><p className="font-bold">{gameInfo.opponent || 'Not set'}</p></div>
            <div className="bg-slate-100 rounded-lg p-3"><p className="text-xs text-slate-500">Pitcher</p><p className="font-bold">{gameInfo.pitcherName || 'Not set'} {pickMove.type && <span className="text-[#1e3a5f]">({pickMove.type})</span>}</p></div>
            <div className="bg-slate-100 rounded-lg p-3"><p className="text-xs text-slate-500">Data</p><p className="font-bold">{pitchLog.length} pitches</p></div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowSaveModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-200">Cancel</button>
              <button onClick={saveCurrentGame} disabled={isSaving || !gameInfo.opponent || !gameInfo.pitcherName} className="flex-1 py-3 rounded-xl font-bold text-white bg-green-500 disabled:bg-slate-400">{isSaving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LoadModal = () => {
    const [viewMode, setViewMode] = useState('games');
    const [selectedPitcher, setSelectedPitcher] = useState(null);
    if (!showLoadModal) return null;
    const filteredGames = getFilteredGames();
    const teams = getUniqueTeams();
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
        <div className="bg-[#1e3a5f] text-white px-4 py-3 flex items-center justify-between safe-top"><h2 className="font-bold flex items-center gap-2"><Database size={18} /> Database</h2><button onClick={() => setShowLoadModal(false)} className="text-slate-300">✕</button></div>
        <div className="bg-[#2d4a6f] px-4 py-2 flex gap-2">
          <button onClick={() => { setViewMode('games'); setSelectedPitcher(null); }} className={`flex-1 py-2 rounded-lg text-sm font-bold ${viewMode === 'games' ? 'bg-[#9bcbeb] text-[#1e3a5f]' : 'bg-[#3d5a7f] text-slate-300'}`}>By Game</button>
          <button onClick={() => { setViewMode('pitchers'); setSelectedPitcher(null); }} className={`flex-1 py-2 rounded-lg text-sm font-bold ${viewMode === 'pitchers' ? 'bg-[#9bcbeb] text-[#1e3a5f]' : 'bg-[#3d5a7f] text-slate-300'}`}>By Pitcher</button>
        </div>
        <div className="bg-slate-100 px-4 py-3 space-y-2">
          <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm" /></div>
          <select value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"><option value="">All Teams</option>{teams.map(team => <option key={team} value={team}>{team}</option>)}</select>
        </div>
        <div className="flex-1 overflow-auto bg-slate-100">
          {viewMode === 'games' && !selectedPitcher && (
            <div className="divide-y divide-slate-200">
              {filteredGames.length === 0 ? <div className="p-8 text-center text-slate-400"><Database size={32} className="mx-auto mb-2 opacity-50" /><p>No saved reports</p></div> : filteredGames.map(game => (
                <div key={game.id} className="bg-white p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1" onClick={() => loadGame(game)}>
                      <div className="flex items-center gap-2">
                        <p className="font-bold">{game.pitcherName}</p>
                        {game.pickMove?.type && <span className={`text-xs px-2 py-0.5 rounded text-white ${pickMoveTypes.find(m => m.name === game.pickMove.type)?.color}`}>{game.pickMove.type}</span>}
                      </div>
                      <p className="text-sm text-slate-600">{game.opponent}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(game.date).toLocaleDateString()} • {game.stats?.totalPitches || 0} pitches</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => loadGame(game)} className="bg-[#1e3a5f] text-white px-3 py-1 rounded text-xs font-bold">Load</button>
                      <button onClick={() => deleteGame(game.id)} className="text-red-500 p-1"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {viewMode === 'pitchers' && !selectedPitcher && (
            <div className="divide-y divide-slate-200">
              {savedPitchers.filter(p => (searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.team.toLowerCase().includes(searchTerm.toLowerCase())) && (filterTeam === '' || p.team === filterTeam)).map(pitcher => (
                <div key={pitcher.id} className="bg-white p-4 flex justify-between items-center" onClick={() => setSelectedPitcher(pitcher)}>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{pitcher.name}</p>
                      {pitcher.pickMove && <span className={`text-xs px-2 py-0.5 rounded text-white ${pickMoveTypes.find(m => m.name === pitcher.pickMove)?.color}`}>{pitcher.pickMove}</span>}
                    </div>
                    <p className="text-sm text-slate-600">{pitcher.team}</p>
                    <p className="text-xs text-slate-400">{pitcher.games.length} game(s)</p>
                  </div>
                  <ChevronRight size={20} className="text-slate-400" />
                </div>
              ))}
            </div>
          )}
          {selectedPitcher && (
            <div>
              <button onClick={() => setSelectedPitcher(null)} className="w-full bg-white p-3 text-left text-sm text-slate-600 border-b flex items-center gap-2"><ChevronLeft size={16} /> Back</button>
              <div className="bg-[#e8f4fc] p-4 border-b"><p className="font-bold text-lg">{selectedPitcher.name}</p><p className="text-sm text-slate-600">{selectedPitcher.team} {selectedPitcher.pickMove && `• ${selectedPitcher.pickMove}`}</p></div>
              <div className="divide-y divide-slate-200">{getPitcherHistory(selectedPitcher.name, selectedPitcher.team).map(game => (
                <div key={game.id} className="bg-white p-4 flex justify-between items-center">
                  <div><p className="font-medium">{new Date(game.date).toLocaleDateString()}</p><p className="text-xs text-slate-500">{game.stats?.totalPitches} pitches</p></div>
                  <button onClick={() => loadGame(game)} className="bg-[#1e3a5f] text-white px-3 py-1 rounded text-xs font-bold">Load</button>
                </div>
              ))}</div>
            </div>
          )}
        </div>
        <div className="bg-white border-t p-4 safe-bottom"><button onClick={() => { startNewGame(); setShowLoadModal(false); }} className="w-full bg-[#1e3a5f] text-white py-3 rounded-xl font-bold">+ New Game</button></div>
      </div>
    );
  };

  const [selectedPitch, setSelectedPitch] = useState(null);

  const PitchTrackerView = (
    <div className="flex flex-col h-full">
      <div className="bg-[#2d4a6f] px-4 py-2 flex items-center justify-between text-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1"><button onClick={() => setCurrentInning(Math.max(1, currentInning - 1))} className="p-1"><ChevronLeft size={16} /></button><span className="text-sm font-bold">INN {currentInning}</span><button onClick={() => setCurrentInning(currentInning + 1)} className="p-1"><ChevronRight size={16} /></button></div>
          <div className="flex gap-1">{[0, 1, 2].map(i => <div key={i} onClick={() => setOuts(i + 1 > 2 ? 0 : i + 1)} className={`w-4 h-4 rounded-full border-2 ${i < outs ? 'bg-red-500 border-red-500' : 'border-slate-400'}`} />)}<span className="text-xs ml-1">OUT</span></div>
        </div>
        <div className="text-2xl font-mono font-bold"><span className="text-green-400">{balls}</span><span className="text-slate-400">-</span><span className="text-red-400">{strikes}</span></div>
      </div>
      <div className="bg-slate-100 px-4 py-2"><input type="text" placeholder="Batter name or #" value={currentBatter} onChange={(e) => setCurrentBatter(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" /></div>
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-100 py-2">
        <p className="text-xs text-slate-500 mb-2">Zone (optional)</p>
        <div className="grid grid-cols-3 gap-1">{[1,2,3,4,5,6,7,8,9].map(zone => <button key={zone} onClick={() => setSelectedZone(selectedZone === zone ? null : zone)} className={`w-14 h-12 border-2 rounded text-xs font-bold ${selectedZone === zone ? 'bg-[#9bcbeb] border-[#1e3a5f] text-[#1e3a5f]' : 'bg-white border-slate-300 text-slate-400'}`}>{zone}</button>)}</div>
      </div>
      <div className="bg-white border-t px-4 py-3">
        <p className="text-xs text-slate-500 mb-2 font-medium">PITCH</p>
        <div className="grid grid-cols-6 gap-2 mb-3">{pitchTypes.map(pt => <button key={pt.name} onClick={() => setSelectedPitch(pt.name)} className={`py-2 rounded-lg text-xs font-bold text-white ${pt.color} ${selectedPitch === pt.name ? 'ring-2 ring-offset-2 ring-[#1e3a5f] scale-105' : 'opacity-80'}`}>{pt.name}</button>)}</div>
        {selectedPitch && <><p className="text-xs text-slate-500 mb-2 font-medium">RESULT</p><div className="grid grid-cols-6 gap-2">{results.map(r => <button key={r.name} onClick={() => { logPitch(selectedPitch, r.name, selectedZone); setSelectedPitch(null); setSelectedZone(null); }} className={`py-2 rounded-lg text-xs font-bold ${r.type === 'strike' || r.type === 'out' ? 'bg-red-100 text-red-700' : ''} ${r.type === 'ball' ? 'bg-green-100 text-green-700' : ''} ${r.type === 'end' ? 'bg-[#e8f4fc] text-[#1e3a5f]' : ''}`}>{r.name}</button>)}</div></>}
      </div>
      <div className="bg-slate-200 px-4 py-2 flex justify-between"><button onClick={resetCount} className="text-xs text-slate-600 font-medium">Reset</button><span className="text-xs text-slate-500">{pitchLog.length} pitches</span></div>
    </div>
  );

  const PitchLogView = () => (
    <div className="flex flex-col h-full bg-slate-100">
      <div className="bg-[#2d4a6f] px-4 py-2 text-white text-sm font-bold">LOG ({pitchLog.length})</div>
      <div className="flex-1 overflow-auto">{pitchLog.length === 0 ? <div className="flex items-center justify-center h-full text-slate-400"><p>No pitches yet</p></div> : <div className="divide-y divide-slate-200">{[...pitchLog].reverse().map((pitch, idx) => { const pt = pitchTypes.find(p => p.name === pitch.pitch); return <div key={pitch.id} className="bg-white px-4 py-3 flex items-center justify-between"><div className="flex items-center gap-3"><span className="text-xs text-slate-400 w-6">{pitchLog.length - idx}</span><div className={`w-10 h-10 rounded-lg ${pt?.color} flex items-center justify-center text-white font-bold text-sm`}>{pitch.pitch}</div><div><p className="text-sm font-medium">{pitch.batter}</p><p className="text-xs text-slate-500">Inn {pitch.inning} • {pitch.count} • {pitch.result}</p></div></div><button onClick={() => deletePitch(pitch.id)} className="text-slate-400 p-2"><Trash2 size={16} /></button></div>; })}</div>}</div>
    </div>
  );

  const StatsView = () => {
    const stats = getPitchStats();
    const countStats = getCountStats();
    const total = pitchLog.length;
    return (
      <div className="flex flex-col h-full bg-slate-100 overflow-auto">
        <div className="bg-[#2d4a6f] px-4 py-2 text-white text-sm font-bold">STATS</div>
        <div className="bg-white m-3 rounded-xl p-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Pitch Usage</h3>
          {pitchTypes.map(pt => { const data = stats[pt.name]; const pct = total > 0 ? Math.round((data.count / total) * 100) : 0; return <div key={pt.name} className="mb-3"><div className="flex justify-between text-xs mb-1"><span>{pt.label}</span><span className="text-slate-500">{data.count} ({pct}%)</span></div><div className="h-3 bg-slate-200 rounded-full overflow-hidden"><div className={`h-full ${pt.color}`} style={{ width: `${pct}%` }} /></div></div>; })}
        </div>
        <div className="bg-white m-3 mt-0 rounded-xl p-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Count Tendencies</h3>
          <div className="space-y-2">{Object.entries(countStats).slice(0,6).map(([count, pitches]) => { const sorted = Object.entries(pitches).sort((a,b) => b[1] - a[1]); return <div key={count} className="flex items-center gap-2"><span className="font-mono font-bold text-sm w-10">{count}</span><div className="flex gap-1">{sorted.slice(0,2).map(([pitch, num]) => { const pt = pitchTypes.find(p => p.name === pitch); return <span key={pitch} className={`px-2 py-1 rounded text-white text-xs ${pt?.color}`}>{pitch}:{num}</span>; })}</div></div>; })}</div>
        </div>
      </div>
    );
  };

  const NotesView = () => (
    <div className="flex flex-col h-full bg-slate-100 overflow-auto">
      <div className="bg-[#2d4a6f] px-4 py-2 text-white text-sm font-bold">NOTES</div>
      <div className="p-3 space-y-3">
        {[{ key: 'fastballVelo', label: 'FB VELOCITY', ph: '82-85' }, { key: 'outPitch', label: 'OUT PITCH', ph: 'Curveball low' }, { key: 'firstPitchTendency', label: 'FIRST PITCH', ph: 'FB middle-in' }].map(f => <div key={f.key} className="bg-white rounded-xl p-4"><label className="text-xs font-bold text-slate-500 block mb-2">{f.label}</label><input type="text" placeholder={f.ph} value={pitcherNotes[f.key]} onChange={(e) => setPitcherNotes({ ...pitcherNotes, [f.key]: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>)}
        {[{ key: 'tipping', label: 'PITCH TIPPING?', ph: 'Any tells?' }, { key: 'weakness', label: 'WEAKNESS', ph: 'Key info...' }].map(f => <div key={f.key} className="bg-white rounded-xl p-4"><label className="text-xs font-bold text-slate-500 block mb-2">{f.label}</label><textarea placeholder={f.ph} value={pitcherNotes[f.key]} onChange={(e) => setPitcherNotes({ ...pitcherNotes, [f.key]: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-20" /></div>)}
      </div>
    </div>
  );

  const DataView = () => (
    <div className="flex flex-col h-full bg-slate-100 overflow-auto">
      <div className="bg-[#2d4a6f] px-4 py-2 text-white text-sm font-bold">DATA</div>
      <div className="p-3 space-y-3">
        <div className="bg-white rounded-xl p-4">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setShowSaveModal(true)} className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg font-bold text-sm"><Upload size={16} /> Save</button>
            <button onClick={() => setShowLoadModal(true)} className="flex items-center justify-center gap-2 bg-[#1e3a5f] text-white py-3 rounded-lg font-bold text-sm"><Download size={16} /> Load</button>
          </div>
          <button onClick={() => setShowShareModal(true)} className="w-full mt-2 bg-[#9bcbeb] text-[#1e3a5f] py-3 rounded-lg font-bold text-sm"><Share2 size={16} className="inline mr-2" />Share</button>
          <p className="text-xs text-slate-400 mt-2 text-center">{savedGames.length} reports • {savedPitchers.length} pitchers</p>
        </div>
        {[{ key: 'opponent', label: 'OPPONENT', ph: 'Team' }, { key: 'pitcherName', label: 'PITCHER', ph: 'Name' }, { key: 'pitcherNumber', label: 'JERSEY #', ph: '#' }].map(f => <div key={f.key} className="bg-white rounded-xl p-4"><label className="text-xs font-bold text-slate-500 block mb-2">{f.label}</label><input type="text" placeholder={f.ph} value={gameInfo[f.key]} onChange={(e) => setGameInfo({ ...gameInfo, [f.key]: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" /></div>)}
        <div className="bg-white rounded-xl p-4"><label className="text-xs font-bold text-slate-500 block mb-2">THROWS</label><div className="flex gap-2"><button onClick={() => setGameInfo({ ...gameInfo, pitcherThrows: 'R' })} className={`flex-1 py-3 rounded-lg font-bold ${gameInfo.pitcherThrows === 'R' ? 'bg-[#1e3a5f] text-white' : 'bg-slate-200'}`}>R</button><button onClick={() => setGameInfo({ ...gameInfo, pitcherThrows: 'L' })} className={`flex-1 py-3 rounded-lg font-bold ${gameInfo.pitcherThrows === 'L' ? 'bg-[#1e3a5f] text-white' : 'bg-slate-200'}`}>L</button></div></div>
        <button onClick={startNewGame} className="w-full bg-red-100 text-red-700 py-3 rounded-xl font-bold text-sm">Clear & New</button>
      </div>
    </div>
  );

  const tabs = [
    { id: 'pitch', label: 'Pitch', icon: Target },
    { id: 'move', label: 'Move', icon: Timer },
    { id: 'log', label: 'Log', icon: ClipboardList },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'notes', label: 'Notes', icon: Zap },
    { id: 'data', label: 'Data', icon: Database }
  ];

  return (
    <div className="h-screen flex flex-col bg-slate-100 max-w-md mx-auto">
      <Header />
      <SaveModal />
      <LoadModal />
      <ShareModal />
      <div className="flex-1 overflow-hidden">
        {activeTab === 'pitch' && PitchTrackerView}
        {activeTab === 'move' && <PickMoveView />}
        {activeTab === 'log' && <PitchLogView />}
        {activeTab === 'stats' && <StatsView />}
        {activeTab === 'notes' && <NotesView />}
        {activeTab === 'data' && <DataView />}
      </div>
      <div className="bg-white border-t px-1 py-2 flex justify-around safe-bottom">
        {tabs.map(tab => { const Icon = tab.icon; return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center py-1 px-2 rounded-lg ${activeTab === tab.id ? 'text-[#1e3a5f]' : 'text-slate-400'}`}><Icon size={18} /><span className="text-xs mt-1 font-medium">{tab.label}</span></button>; })}
      </div>
    </div>
  );
}
