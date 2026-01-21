// IRT Logic and Visualization

const state = {
    a: 1.0,
    b: 0.0,
    c: 0.0,
    d: 1.0,
    showInfo: true
};

// 4PL Function: P(theta)
function calculateProb(theta, a, b, c, d) {
    const exponent = -a * (theta - b);
    const logistic = 1 / (1 + Math.exp(exponent));
    return c + (d - c) * logistic;
}

// Information Function: I(theta)
function calculateInfo(theta, a, b, c, d) {
    const prob = calculateProb(theta, a, b, c, d);
    const q = 1 - prob;

    // Avoid division by zero
    if (prob <= 0.0001 || prob >= 0.9999) return 0;

    // Derivative Calculation    
    const exponent = -a * (theta - b);
    const logistic = 1 / (1 + Math.exp(exponent)); // L
    const derivativeP = a * (d - c) * logistic * (1 - logistic);

    // Fisher Information I(theta) = [P']^2 / (P * Q)
    const info = (derivativeP * derivativeP) / (prob * q);

    return info;
}

// Generate data for plotting
function generateData() {
    const x = [];
    const y_icc = [];
    const y_iif = [];
    const step = 0.1;

    for (let theta = -4; theta <= 4; theta += step) {
        x.push(theta);
        y_icc.push(calculateProb(theta, state.a, state.b, state.c, state.d));
        if (state.showInfo) {
            y_iif.push(calculateInfo(theta, state.a, state.b, state.c, state.d));
        }
    }

    return { x, y_icc, y_iif };
}

// DOM Elements
const sliders = {
    a: document.getElementById('slider-a'),
    b: document.getElementById('slider-b'),
    c: document.getElementById('slider-c'),
    d: document.getElementById('slider-d')
};

const displays = {
    a: document.getElementById('val-a'),
    b: document.getElementById('val-b'),
    c: document.getElementById('val-c'),
    d: document.getElementById('val-d')
};

const formulaEl = document.getElementById('formula-display');
const resetBtn = document.getElementById('reset-btn');
const checkInfo = document.getElementById('check-info');

// Initialize everything
function init() {
    // Initialize icons
    lucide.createIcons();

    // Add event listeners (Sliders)
    Object.keys(sliders).forEach(key => {
        const slider = sliders[key];
        slider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            state[key] = val;

            // Update value display
            displays[key].textContent = key === 'a' || key === 'b' ? val.toFixed(1) : val.toFixed(2);

            requestAnimationFrame(() => {
                updatePlot();
                renderMath();
            });
        });
    });

    // Checkbox Listener
    if (checkInfo) {
        checkInfo.addEventListener('change', (e) => {
            state.showInfo = e.target.checked;
            updatePlot();
        });
    }

    // Reset Button
    if (resetBtn) resetBtn.addEventListener('click', resetParams);

    // Window resize
    window.addEventListener('resize', () => {
        const div = document.getElementById('plot-container');
        if (div) Plotly.Plots.resize(div);
    });

    // Initial Render
    renderPlot();
    renderMath();
}


function renderMath() {
    const tex = `P(\\theta) = ${state.c.toFixed(2)} + \\frac{${state.d.toFixed(2)} - ${state.c.toFixed(2)}}{1 + e^{-${state.a.toFixed(1)}(\\theta - ${state.b >= 0 ? state.b.toFixed(1) : '(' + state.b.toFixed(1) + ')'})}}`;

    katex.render(tex, formulaEl, {
        throwOnError: false,
        displayMode: true
    });
}

function renderPlot() {
    const data = generateData();

    // Trace 1: Probability
    const traceICC = {
        x: data.x,
        y: data.y_icc,
        mode: 'lines',
        name: 'Probability P(θ)',
        line: { color: '#4f46e5', width: 3 }, // Indigo
        hoverinfo: 'x+y'
    };

    const traces = [traceICC];

    // Trace 2: Information
    if (state.showInfo) {
        const traceIIF = {
            x: data.x,
            y: data.y_iif,
            mode: 'lines',
            name: 'Information I(θ)',
            line: { color: '#dc2626', width: 3 }, // Red
            fill: 'tozeroy',
            fillcolor: 'rgba(220, 38, 38, 0.1)',
            hoverinfo: 'x+y'
        };
        traces.push(traceIIF);
    }

    // Asymptotes
    const traceC = {
        x: [-4, 4],
        y: [state.c, state.c],
        mode: 'lines',
        name: 'Guessing (c)',
        line: { color: '#94a3b8', width: 2, dash: 'dash' },
        hoverinfo: 'none',
        showlegend: false
    };

    const traceD = {
        x: [-4, 4],
        y: [state.d, state.d],
        mode: 'lines',
        name: 'Inattention (d)',
        line: { color: '#94a3b8', width: 2, dash: 'dash' },
        hoverinfo: 'none',
        showlegend: false
    };

    traces.push(traceC, traceD);

    const layout = {
        font: { family: 'Inter, sans-serif' },
        margin: { t: 40, r: 40, b: 50, l: 60 },
        autosize: true,
        xaxis: {
            title: 'Ability (θ)',
            range: [-4, 4],
            zeroline: true,
            showgrid: true,
            gridcolor: '#f1f5f9',
            dtick: 1
        },
        yaxis: {
            title: 'Value',
            autorange: true,
            showgrid: true,
            gridcolor: '#f1f5f9',
        },
        showlegend: true,
        legend: { x: 0.05, y: 1.1, orientation: 'h' },
        hovermode: 'closest',
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };

    const config = {
        responsive: true,
        displayModeBar: false,
        scrollZoom: false
    };

    Plotly.newPlot('plot-container', traces, layout, config);
}

function updatePlot() {
    const data = generateData();
    const div = document.getElementById('plot-container');

    const traceICC = {
        x: data.x,
        y: data.y_icc,
        mode: 'lines',
        name: 'Probability P(θ)',
        line: { color: '#4f46e5', width: 3 },
        hoverinfo: 'x+y'
    };

    const traces = [traceICC];

    if (state.showInfo) {
        const traceIIF = {
            x: data.x,
            y: data.y_iif,
            mode: 'lines',
            name: 'Information I(θ)',
            line: { color: '#dc2626', width: 3 },
            fill: 'tozeroy',
            fillcolor: 'rgba(220, 38, 38, 0.1)',
            hoverinfo: 'x+y'
        };
        traces.push(traceIIF);
    }

    const traceC = {
        x: [-4, 4],
        y: [state.c, state.c],
        mode: 'lines',
        name: 'Guessing (c)',
        line: { color: '#94a3b8', width: 2, dash: 'dash' },
        hoverinfo: 'none',
        showlegend: false
    };

    const traceD = {
        x: [-4, 4],
        y: [state.d, state.d],
        mode: 'lines',
        name: 'Inattention (d)',
        line: { color: '#94a3b8', width: 2, dash: 'dash' },
        hoverinfo: 'none',
        showlegend: false
    };

    traces.push(traceC, traceD);

    Plotly.react('plot-container', traces, div.layout, div._context || { responsive: true });
}

function resetParams() {
    state.a = 1.0;
    state.b = 0.0;
    state.c = 0.0;
    state.d = 1.0;
    state.showInfo = true;

    if (checkInfo) checkInfo.checked = true;

    // Update inputs
    sliders.a.value = "1.0";
    sliders.b.value = "0.0";
    sliders.c.value = "0.0";
    sliders.d.value = "1.0";

    // Update text
    displays.a.textContent = "1.0";
    displays.b.textContent = "0.0";
    displays.c.textContent = "0.00";
    displays.d.textContent = "1.00";

    updatePlot();
    renderMath();
}

// Start
document.addEventListener('DOMContentLoaded', init);
