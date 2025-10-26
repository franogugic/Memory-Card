import React, { useEffect, useState } from "react";
import wallpaper from "./public/disney.jpg";
import "./index.css";

function App() {
    const difficultys = ["easy", "medium", "hard"];

    const [cards, setCards] = useState([]);
    const [playerData, setPlayerData] = useState({
        level: 1,
        score: 0,
        difficulty: "",
    });
    const [isFlipping, setIsFlipping] = useState(false);
    const [modal, setModal] = useState(null);
    const [loading, setLoading] = useState(false);

    const SHUFFLE_MS = 800;

    const levelSetup = {
        easy: { 1: 4, 2: 5, 3: 7 },
        medium: { 1: 7, 2: 8, 3: 10, 4: 12 },
        hard: { 1: 10, 2: 12, 3: 13, 4: 14, 5: 16 },
    };

    const levelPoints = {
        easy: { 1: 50, 2: 60, 3: 80 },
        medium: { 1: 100, 2: 120, 3: 130, 4: 150 },
        hard: { 1: 180, 2: 190, 3: 200, 4: 220, 5: 250 },
    };

    const displayCountByDifficulty = {
        easy: 4,
        medium: 6,
        hard: 8,
    };

    const getActiveCount = (difficulty, level) =>
        levelSetup[difficulty]?.[level] ?? 0;

    const activeCount = getActiveCount(playerData.difficulty, playerData.level);
    const displayCount = displayCountByDifficulty[playerData.difficulty] ?? 4;

    useEffect(() => {
        if (playerData.difficulty !== "") {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    const randomPage = Math.floor(Math.random() * 50) + 1;
                    const res = await fetch(
                        `https://api.disneyapi.dev/character?page=${randomPage}&pageSize=50`
                    );
                    const data = await res.json();

                    const mappedData = data.data.map((item) => ({
                        _id: item._id,
                        name: item.name,
                        imageUrl: item.imageUrl,
                        wasClicked: false,
                    }));

                    const randomized = shuffleCards(mappedData).slice(0, 16);
                    setCards(randomized);
                } catch (e) {
                    console.error("Error fetching cards:", e);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [playerData.difficulty]);

    const shuffleCards = (arr) => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    const handleButtonClick = (selectedDifficulty) => {
        setPlayerData({ ...playerData, difficulty: selectedDifficulty });
    };

    const handleRestart = () => {
        setPlayerData((prev) => ({
            ...prev,
            level: 1,
            score: 0,
        }));
        setCards((prev) => prev.map((c) => ({ ...c, wasClicked: false })));
        setIsFlipping(false);
        setModal(null);
    };

    const handleBackToMenu = () => {
        setPlayerData({ level: 1, score: 0, difficulty: "" });
        setIsFlipping(false);
        setModal(null);
    };

    const handleCardClick = (_id) => {
        if (isFlipping || modal) return;

        const activeCount = getActiveCount(playerData.difficulty, playerData.level);
        const clickedCard = cards.find((card) => card._id === _id);
        if (!clickedCard) return;

        if (clickedCard.wasClicked) {
            setModal({ type: "gameover", message: "Game Over! Try Again!" });
            return;
        }

        setPlayerData((prev) => ({
            ...prev,
            score: prev.score + (levelPoints[prev.difficulty]?.[prev.level] ?? 50),
        }));

        // 1️⃣ prvo okreni sve karte
        setIsFlipping(true);

        // 2️⃣ nakon pola animacije promiješaj aktivne karte
        setTimeout(() => {
            setCards((prev) => {
                const marked = prev.map((card) =>
                    card._id === _id ? { ...card, wasClicked: true } : card
                );
                const shuffledActive = shuffleCards(marked.slice(0, activeCount));
                const rest = marked.slice(activeCount);
                return [...shuffledActive, ...rest];
            });
        }, SHUFFLE_MS / 2);

        // 3️⃣ nakon cijele animacije vrati karte natrag
        setTimeout(() => {
            setIsFlipping(false);
            setCards((prev) => {
                const nowActive = prev.slice(0, activeCount);
                const allClicked = nowActive.every((c) => c.wasClicked);

                if (!allClicked) return prev;

                const nextLevel = playerData.level + 1;
                const nextCount = getActiveCount(playerData.difficulty, nextLevel);

                if (!nextCount) {
                    setModal({ type: "win", message: "🏰 You Finished All Levels!" });
                    return prev.map((c, i) =>
                        i < activeCount ? { ...c, wasClicked: false } : c
                    );
                }

                setPlayerData((ps) => ({ ...ps, level: nextLevel }));
                setModal({
                    type: "level",
                    message: `✨ Level ${nextLevel} Unlocked! ✨`,
                });

                return prev.map((c, i) =>
                    i < nextCount ? { ...c, wasClicked: false } : c
                );
            });
        }, SHUFFLE_MS);
    };

    const gridClass =
        displayCount === 4
            ? "grid-cols-4"
            : displayCount === 6
                ? "grid-cols-6"
                : "grid-cols-4 grid-rows-2";

    if (loading) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white z-[999] animate-fadein">
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Disney_wordmark.svg"
                    alt="Disney logo"
                    className="w-[320px] mb-10 animate-pulse-glow"
                />
                <div className="flex space-x-3">
                    <div className="w-4 h-4 bg-[#00bfff] rounded-full animate-bounce delay-0"></div>
                    <div className="w-4 h-4 bg-[#00bfff] rounded-full animate-bounce delay-150"></div>
                    <div className="w-4 h-4 bg-[#00bfff] rounded-full animate-bounce delay-300"></div>
                </div>
            </div>
        );
    }

    return (
        <div
            key={playerData.difficulty || "menu"} // 🔁 force-repaint pri promjeni scene
            className="fixed top-0 left-0 w-screen h-screen overflow-hidden flex items-center justify-center"
            style={{
                backgroundColor: "#000",
                backgroundImage: `url(${wallpaper})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                transform: "translateZ(0)",
                willChange: "opacity, transform",
            }}
        >
            <div
                className="absolute inset-0 bg-black/70"
                style={{
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    transform: "translateZ(0)",
                }}
            />



            {playerData.difficulty === "" ? (
                <div className="relative z-10 text-white p-10 flex flex-col items-center justify-center text-center">
                    <h1
                        className="text-[90px] text-center py-12 font-[Luckiest_Guy] leading-[1.1]"
                        style={{
                            textShadow: "0 0 8px #fff, 0 0 20px #00bfff, 0 0 40px #00bfff",
                            letterSpacing: "2px",
                        }}
                    >
                        Memory Game
                    </h1>
                    <div className="flex items-center justify-around w-full gap-8 mt-4">
                        {difficultys.map((difficulty) => (
                            <button
                                key={difficulty}
                                className="bg-gradient-to-r from-[#00bfff] to-[#0066ff] cursor-pointer text-white rounded-xl px-8 py-3 font-bold uppercase shadow-lg hover:scale-110 hover:shadow-[#00bfff]/50 transition-all duration-200"
                                onClick={() => handleButtonClick(difficulty)}
                            >
                                {difficulty}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="relative z-10 flex flex-col items-center w-full">
                    <div className="fixed top-0 left-0 w-full bg-[#00000070] backdrop-blur-md flex items-center justify-between py-4 px-8 text-white shadow-md z-50 border-b border-[#00bfff40]">
                        <h1
                            className="text-3xl font-[Luckiest_Guy] cursor-pointer transition-all hover:scale-105"
                            style={{
                                textShadow: "0 0 4px #fff, 0 0 8px #00bfff, 0 0 12px #00bfff",
                            }}
                            onClick={handleBackToMenu}
                        >
                            Memory Game
                        </h1>

                        <div className="flex justify-center gap-16 items-center text-center">
                            <div>
                                <p className="text-sm opacity-70">Difficulty</p>
                                <p className="text-xl font-bold capitalize">
                                    {playerData.difficulty}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm opacity-70">Level</p>
                                <p className="text-xl font-bold">{playerData.level}</p>
                            </div>
                            <div>
                                <p className="text-sm opacity-70">Score</p>
                                <p className="text-xl font-bold">{playerData.score}</p>
                            </div>
                        </div>

                        <button
                            className="bg-gradient-to-r from-[#00bfff] to-[#007bff] text-white font-bold px-5 py-2 rounded-lg shadow-md hover:scale-105 hover:shadow-[#00bfff]/50 transition-all duration-200"
                            onClick={handleRestart}
                        >
                            Restart
                        </button>
                    </div>

                    <div className={`mt-28 grid ${gridClass} gap-6 justify-center items-center`}>
                        {cards
                            .slice(0, activeCount)
                            .slice(0, displayCount)
                            .map((card) => (
                                <div
                                    key={`${card._id}-${card.name}`}
                                    className="relative card w-[140px] h-[200px] cursor-pointer perspective"
                                    onClick={() => handleCardClick(card._id)}
                                >
                                    <div
                                        className={`flip-card-inner w-full h-full transition-transform duration-[${SHUFFLE_MS}ms] ${
                                            isFlipping ? "rotate-y-180" : ""
                                        }`}
                                    >
                                        <div className="flip-card-front absolute w-full h-full rounded-2xl overflow-hidden shadow-lg">
                                            <img
                                                src={
                                                    card.imageUrl ||
                                                    "https://upload.wikimedia.org/wikipedia/commons/a/a4/Disney_wordmark.svg"
                                                }
                                                alt={card.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute bottom-0 w-full bg-black/70 text-white text-center py-2 text-sm font-semibold">
                                                {card.name}
                                            </div>
                                        </div>

                                        <div
                                            className="flip-card-back absolute w-full h-full rounded-2xl border-4 border-[#ffffff40] shadow-xl flex flex-col items-center justify-center overflow-hidden relative"
                                            style={{
                                                backgroundImage: `
                          radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 60%),
                          url('https://www.transparenttextures.com/patterns/diamond-upholstery.png'),
                          linear-gradient(135deg, #003cff 0%, #007fff 50%, #00bfff 100%)
                        `,
                                                backgroundSize: "cover",
                                            }}
                                        >
                                            <div className="shine absolute inset-0"></div>
                                            <p className="relative text-4xl font-[cursive] font-bold text-white tracking-wider global-softglow drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]">
                                                Disney
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {modal && (
                        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-[999] animate-fadein">
                            <div
                                className={`relative rounded-3xl p-10 text-center shadow-2xl w-[500px] ${
                                    modal.type === "gameover"
                                        ? "bg-gradient-to-br from-[#ff0033] to-[#ff6b6b]"
                                        : "bg-gradient-to-br from-[#00bfff] to-[#0066ff]"
                                }`}
                            >
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/en/4/4f/Walt_Disney_Pictures_logo.svg"
                                    alt="Disney Castle"
                                    className="absolute opacity-10 top-0 left-0 w-full h-full object-contain"
                                />
                                <h1 className="text-4xl font-[Luckiest_Guy] text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.6)] mb-6 relative z-10">
                                    {modal.message}
                                </h1>
                                <button
                                    className="mt-4 bg-white/90 text-[#003cff] font-bold px-8 py-3 rounded-xl hover:scale-105 transition-all duration-200 shadow-lg relative z-10"
                                    onClick={() => {
                                        if (modal.type === "gameover") handleRestart();
                                        else setModal(null);
                                    }}
                                >
                                    {modal.type === "gameover" ? "Try Again" : "Continue"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;
