import React, { useState } from 'react'

export function Calculator() {
  const [expr, setExpr] = useState('');
  const [res, setRes] = useState('');
  // Tracks if the current expression is a final result
  const [isResult, setIsResult] = useState(false);

  // Safely evaluates the expression by mapping functions and constants to Math properties
  function evalExpr() {
    if (!expr) return;
    try {
      // Create a safer version of the expression for evaluation
      const safeExpr = expr
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.ln(')
        .replace(/\^/g, '**');

      const val = Function(`"use strict"; return (${safeExpr})`)();
      
      // Handle potential floating point inaccuracies
      const resultStr = String(parseFloat(val.toPrecision(15)));
      setRes(resultStr);
      setExpr(resultStr); // Set the next expression to start with the result
      setIsResult(true);
    } catch {
      setRes('Error');
      setIsResult(true);
    }
  }

  // Handles all button clicks and updates the expression
  const handleButtonClick = (value: string) => {
    if (isResult) {
      // If the last action was '=', start a new expression
      setExpr('');
      setRes('');
      setIsResult(false);
    }

    switch (value) {
      case '=':
        evalExpr();
        break;
      case 'AC':
        setExpr('');
        setRes('');
        break;
      case 'DEL':
        setExpr((prev) => prev.slice(0, -1));
        break;
      case 'sin': case 'cos': case 'tan':
      case 'log': case 'ln': case '√':
        setExpr((prev) => prev + value + '(');
        break;
      default:
        // If starting a new expression after a result, handle appropriately
        if (isResult) {
          if ('+-*/^'.includes(value)) {
            setExpr(expr + value); // Use the previous result
          } else {
            setExpr(value); // Start fresh
          }
          setIsResult(false);
        } else {
          setExpr((prev) => prev + value);
        }
    }
  };
  
  // Define the layout of the calculator buttons
  const buttons = [
    ['sin', 'cos', 'tan', 'log', 'ln'],
    ['(', ')', '^', '√', 'AC'],
    ['7', '8', '9', 'DEL', '/'],
    ['4', '5', '6', 'π', '*'],
    ['1', '2', '3', 'e', '-'],
    ['0', '.', '=', '+']
  ];

  return (
    <div className="p-3 space-y-2 w-full max-w-sm mx-auto">
      {/* Display Screen */}
      <div className="retro-border bg-black/30 p-2 text-right space-y-1">
        <div className="h-8 text-2xl text-[var(--text)] overflow-x-auto">{expr || '0'}</div>
        <div className="h-6 text-lg text-[var(--text-dim)]">{res}</div>
      </div>
      
      {/* Button Grid */}
      <div className="grid grid-cols-5 gap-2">
        {buttons.flat().map((btn) => {
          const isOperator = 'ACDEL/*-+='.includes(btn);
          const isWide = btn === '0' || btn === '=';
          return (
            <button
              key={btn}
              onClick={() => handleButtonClick(btn)}
              className={`btn retro-border text-lg h-12 ${isOperator ? 'bg-black/20' : ''} ${isWide ? 'col-span-2' : ''}`}
            >
              {btn}
            </button>
          );
        })}
      </div>
    </div>
  );
}