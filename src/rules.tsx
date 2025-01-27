import React from "react";

const Rules = () => {
    const Card = ({ suit, num }: { suit: string; num: string | number }) => {
        return (
            <button style={{ margin: 5 }} className="hand-card-rules inline-flex justify-center items-center w-16 h-24 border rounded-lg">
                <div className="card-content text-center">
                    <div className="card-suit text-lg">{suit}</div>
                    <div className="card-number text-sm font-bold">{num}</div>
                </div>
            </button>
        );
    };
    const suits = ["♦️", "♠️", "♥️", "♣️", "🔺", "⭐", "⚡", "🌟"];
    return (
        <div className="flex flex-col min-h-screen">
            {/* Main Content */}
            <div className="flex flex-col items-center space-y-8">

                {/* Rules Section */}
                <div className="grid grid-cols-2 gap-8">
                    {/* Basic Rules */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Basic</h2>
                        <div className="flex items-center space-x-4">
                            <Card suit="⭐" num="X" />
                            <span className="text-lg">+</span>
                            <Card suit="🌟" num="Y" />
                            <span className="text-lg">=</span>
                            <span className="text-lg"> X + Y </span>
                        </div>
                    </div>

                    {/* Color Rules */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Color</h2>
                        <div className="space-y-4">
                            {[10, 20, 40, 80].map((value, index) => (
                                <div key={index} style={{ marginTop: 10 }} className="flex items-center space-x-2">
                                    {Array.from({ length: index + 2 }).map((_, i) => (
                                        <Card suit="⭐" num="X" key={i} />
                                    ))}
                                    <span className="text-lg"> = {value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Duel Rules */}
                    <div className="col-span-2">
                        <h2 className="text-lg font-semibold mb-4">Duel</h2>
                        <div className="space-y-4">
                            {[2, 3, 4, 5].map((multiplier, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    {Array.from({ length: multiplier }).map((_, i) => (
                                        <Card suit={suits[i]} num="X" key={i} />
                                    ))}
                                    <span className="text-lg">=  {5 * (2 ** (multiplier - 2))}  + (X) × {multiplier - 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Duel Rules */}
                    <div className="col-span-2">
                        <h2 className="text-lg font-semibold mb-4">Flush</h2>
                        <div className="space-y-4">
                            {[2, 3, 4, 5].map((multiplier, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    {Array.from({ length: multiplier }).map((_, i) => (
                                        <Card suit={suits[i]} num={"X + " + (multiplier - i)} key={i} />
                                    ))}
                                    <span className="text-lg">=  {10 * (2 ** (multiplier - 2))} </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Duel Rules */}
                    <div className="col-span-2">
                        <h2 className="text-lg font-semibold mb-4">Wheel</h2>
                        <div className="space-y-4">
                            <Card suit="🎡" num="0" />
                            <span className="text-lg">=</span>
                            <span className="text-lg"> 10% Pool Prize + 0 Point </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Rules;
