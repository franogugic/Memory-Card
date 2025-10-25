import React, {useEffect, useState} from "react";
import wallpaper from "./public/disney.jpg";
function App() {
    console.log("app je ocitan")
    const difficultys = ["easy", "medium", "hard"]
    const [cards, setCards] = useState([])
    const [playerData, setPlayerData] = useState({
        level: 1,
        score: 0,
        difficulty: "",
    })
    
    useEffect(() => {
        
        if(playerData.difficulty !== "") {
            const fetchData = async () => {
                try {
                    const res = await fetch("https://api.disneyapi.dev/character?pageSize="+"10")
                    const data = await res.json()
                    
                    const mappedData = data.data.map(item => ({
                        _id: item._id,
                        name: item.name,
                        imageUrl: item.imageUrl, 
                        wasClicked: false
                    }))
                    setCards(mappedData)
                    console.log(mappedData)
                }
                catch(e) {
                    console.log("ERROR", e)
                }
            }
            
            fetchData()
        }
    }, [playerData.difficulty])

    const handleButtonClick = (selectedDifficulty) => {
        console.log("Kliknuo:", selectedDifficulty);
        setPlayerData({ ...playerData, difficulty: selectedDifficulty });
    };
    
    const handleCardClick = (_id) => {
        
        const clickedCard = cards.find((card) => card._id === _id);
        console.log(clickedCard)
        if(clickedCard.wasClicked) {
            alert("game Over");
            setPlayerData({difficulty: "", level: 1, score: 0 });
            setCards(cards.map(c => ({ ...c, wasClicked: false })));
            return;
        }
        console.log(clickedCard.wasClicked);

        setCards((prevCards) => {
            const updated = prevCards.map((card) =>
                card._id === _id ? { ...card, wasClicked: true } : card
            );
            const shuffled = shuffleCards(updated);
            return shuffled;
        });
        
        setPlayerData((prev) => ({
            ...prev,
            score: prev.score + 50,
        }));
        
        console.log(playerData);
    }

    const shuffleCards = (cards) => {
        const shuffled = [...cards];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };


    return (
        <>  
            
            <div 
                className="absolute top-0 left-0 z-10 overflow-hidden bg-cover bg-center w-screen h-screen flex items-center justify-center"
                style={{ backgroundImage: `url(${wallpaper})` }}
            >
                <div
                    className="absolute inset-0 bg-black/90"
                ></div>

                <div className="relative z-10 text-white p-10 flex items-center justify-center flex-col">

                    { playerData.difficulty == "" ? 
                        <>
                        <img
                        src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Disney_wordmark.svg"
                        alt="Disney logo"
                        className="invert brightness-0 w-xl "
                        />
    
                    <h1
                        className="text-7xl text-white text-center font-[Luckiest_Guy] py-16"
                        style={{
                            textShadow: "0 0 5px #fff, 0 0 10px #00bfff, 0 0 20px #00bfff",
                            animation: "softPulse 1.5s ease-in-out infinite",
                            letterSpacing: "2px",
                        }}
                    >
                        Memory Game
                    </h1>
                    <div className="flex items-center justify-around w-full">
                        {difficultys.map((difficulty) => (
                            <button 
                                key={difficulty}
                                className="bg-[#00bfff] cursor-pointer text-amber-50 rounded-xl px-6 py-2 font-bold transition-transform duration-200 hover:scale-110"
                                onClick={() => handleButtonClick(difficulty)}
                            >{difficulty}
                            </button>
                        ))}
                    </div>
                    </>
                    :
                        <div className="flex justify-between flex-col">
                            <div className="flex justify-around mb-12">
                                <p>{playerData.difficulty}</p>
                                <p>{playerData.level}</p>
                                <p>{playerData.score}</p>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                {cards?.map((card) => (
                                    <div key={card?._id} className="bg-white text-red-500 px-6 py-2 cursor-pointer" onClick={() => handleCardClick(card._id)}>
                                        {card?.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    }
                    
                </div> 
                
             </div>
        </>
  )
}


export default App
