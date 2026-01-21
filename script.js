// IRT Logic and Visualization

const state = {
    a: 1.0,
    b: 0.0,
    c: 0.0,
    d: 1.0
};

// 4PL Function
function calculateProb(theta, a, b, c, d) {
    const exponent = -a * (theta - b);
    const logistic = 1 / (1 + Math.exp(exponent));
    return c + (d - c) * logistic;
}

// Generate data for plotting
function generateData() {
    const x = [];
    const y = [];
    const step = 0.1;

    for (let theta = -4; theta <= 4; theta += step) {
        x.push(theta);
        y.push(calculateProb(theta, state.a, state.b, state.c, state.d));
    }

    return { x, y };
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

// Initialize everything
function init() {
    // Initialize icons
    lucide.createIcons();

    // Render initial graph
    renderPlot();

    // Render initial math
    renderMath();

    // Add event listeners
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

    resetBtn.addEventListener('click', resetParams);

    // Add window resize listener
    window.addEventListener('resize', () => {
        Plotly.Plots.resize('plot-container');
    });
}

function renderMath() {
    // P(\theta) = c + \frac{d - c}{1 + e^{-a(\theta - b)}}
    const tex = `P(\\theta) = ${state.c.toFixed(2)} + \\frac{${state.d.toFixed(2)} - ${state.c.toFixed(2)}}{1 + e^{-${state.a.toFixed(1)}(\\theta - ${state.b >= 0 ? state.b.toFixed(1) : '(' + state.b.toFixed(1) + ')'})}}`;

    // More abstract version if preferred, but user requested live values updating? 
    // "display the live formula above the graph, updating as sliders move" implies substituting values.

    katex.render(tex, formulaEl, {
        throwOnError: false,
        displayMode: true
    });
}

function renderPlot() {
    const data = generateData();

    const trace1 = {
        x: data.x,
        y: data.y,
        mode: 'lines',
        name: 'Probability',
        line: {
            color: '#4f46e5', // Indigo 600
            width: 3
        },
        hoverinfo: 'x+y'
    };

    // Asymptotes
    const traceC = {
        x: [-4, 4],
        y: [state.c, state.c],
        mode: 'lines',
        name: 'Guessing (c)',
        line: {
            color: '#94a3b8', // Slate 400
            width: 2,
            dash: 'dash'
        },
        hoverinfo: 'none'
    };

    const traceD = {
        x: [-4, 4],
        y: [state.d, state.d],
        mode: 'lines',
        name: 'Inattention (d)',
        line: {
            color: '#94a3b8', // Slate 400
            width: 2,
            dash: 'dash'
        },
        hoverinfo: 'none'
    };

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
            title: 'Probability P(θ)',
            range: [-0.05, 1.05], // slight padding
            showgrid: true,
            gridcolor: '#f1f5f9',
            dtick: 0.1
        },
        showlegend: false,
        hovermode: 'closest',
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };

    const config = {
        responsive: true,
        displayModeBar: false, // Cleaner look
        scrollZoom: false
    };

    Plotly.newPlot('plot-container', [trace1, traceC, traceD], layout, config);
}

function updatePlot() {
    const data = generateData();
    const div = document.getElementById('plot-container');

    // Explicitly rebuild traces to ensure Plotly detects changes
    const trace1 = {
        x: data.x,
        y: data.y,
        mode: 'lines',
        name: 'Probability',
        line: {
            color: '#4f46e5', // Indigo 600
            width: 3
        },
        hoverinfo: 'x+y'
    };

    // Asymptotes
    const traceC = {
        x: [-4, 4],
        y: [state.c, state.c],
        mode: 'lines',
        name: 'Guessing (c)',
        line: {
            color: '#94a3b8', // Slate 400
            width: 2,
            dash: 'dash'
        },
        hoverinfo: 'none'
    };

    const traceD = {
        x: [-4, 4],
        y: [state.d, state.d],
        mode: 'lines',
        name: 'Inattention (d)',
        line: {
            color: '#94a3b8', // Slate 400
            width: 2,
            dash: 'dash'
        },
        hoverinfo: 'none'
    };

    const config = {
        responsive: true,
        displayModeBar: false,
        scrollZoom: false
    };

    // Use Plotly.react with fresh data but preserve the current layout
    Plotly.react('plot-container', [trace1, traceC, traceD], div.layout, config);
}

function resetParams() {
    state.a = 1.0;
    state.b = 0.0;
    state.c = 0.0;
    state.d = 1.0;

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

// Start when DOM and deferred scripts are ready
document.addEventListener('DOMContentLoaded', init);
