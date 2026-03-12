// PRAXIS — Application Logic

(function () {
  'use strict';

  // DOM Elements
  const startBtn = document.getElementById('startBtn');
  const inputSection = document.getElementById('inputSection');
  const priorityForm = document.getElementById('priorityForm');
  const prioritiesList = document.getElementById('prioritiesList');
  const addPriorityBtn = document.getElementById('addPriorityBtn');
  const generateBtn = document.getElementById('generateBtn');
  const loadingSection = document.getElementById('loadingSection');
  const loadingStatus = document.getElementById('loadingStatus');
  const outputSection = document.getElementById('outputSection');
  const matchedCategories = document.getElementById('matchedCategories');
  const protocolList = document.getElementById('protocolList');
  const synergiesSection = document.getElementById('synergiesSection');
  const synergiesList = document.getElementById('synergiesList');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const resetBtn = document.getElementById('resetBtn');
  const copyToast = document.getElementById('copyToast');

  let priorityCount = 1;

  // ---- Navigation ----

  startBtn.addEventListener('click', () => {
    inputSection.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      const firstInput = prioritiesList.querySelector('.priority-input');
      if (firstInput) firstInput.focus();
    }, 600);
  });

  // ---- Priority Inputs ----

  function createPriorityInput(index) {
    const group = document.createElement('div');
    group.className = 'priority-input-group';
    group.dataset.index = index;

    const num = String(index + 1).padStart(2, '0');
    group.innerHTML = `
      <span class="priority-number">${num}</span>
      <input
        type="text"
        class="priority-input"
        placeholder="e.g., Sleep optimization, Career growth, Fitness..."
        autocomplete="off"
      >
      <button type="button" class="btn-remove" title="Remove">&#10005;</button>
    `;

    const removeBtn = group.querySelector('.btn-remove');
    removeBtn.addEventListener('click', () => {
      group.remove();
      updatePriorityNumbers();
      updateRemoveButtons();
    });

    return group;
  }

  function updatePriorityNumbers() {
    const groups = prioritiesList.querySelectorAll('.priority-input-group');
    groups.forEach((group, i) => {
      group.dataset.index = i;
      group.querySelector('.priority-number').textContent = String(i + 1).padStart(2, '0');
    });
    priorityCount = groups.length;
  }

  function updateRemoveButtons() {
    const groups = prioritiesList.querySelectorAll('.priority-input-group');
    groups.forEach(group => {
      const btn = group.querySelector('.btn-remove');
      btn.style.visibility = groups.length <= 1 ? 'hidden' : 'visible';
    });
  }

  addPriorityBtn.addEventListener('click', () => {
    const newInput = createPriorityInput(priorityCount);
    prioritiesList.appendChild(newInput);
    priorityCount++;
    updateRemoveButtons();
    newInput.querySelector('.priority-input').focus();
  });

  // Setup initial remove button handler
  const initialRemoveBtn = prioritiesList.querySelector('.btn-remove');
  if (initialRemoveBtn) {
    initialRemoveBtn.addEventListener('click', () => {
      // Don't remove the last one
    });
  }

  // ---- Suggestion Tags ----

  document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const value = tag.dataset.value;
      tag.classList.toggle('active');

      if (tag.classList.contains('active')) {
        // Find empty input or create new one
        const inputs = prioritiesList.querySelectorAll('.priority-input');
        let filled = false;
        for (const input of inputs) {
          if (!input.value.trim()) {
            input.value = value;
            filled = true;
            break;
          }
        }
        if (!filled) {
          const newInput = createPriorityInput(priorityCount);
          prioritiesList.appendChild(newInput);
          priorityCount++;
          updateRemoveButtons();
          newInput.querySelector('.priority-input').value = value;
        }
      } else {
        // Remove the value from inputs
        const inputs = prioritiesList.querySelectorAll('.priority-input');
        for (const input of inputs) {
          if (input.value === value) {
            const group = input.closest('.priority-input-group');
            const groups = prioritiesList.querySelectorAll('.priority-input-group');
            if (groups.length > 1) {
              group.remove();
              updatePriorityNumbers();
              updateRemoveButtons();
            } else {
              input.value = '';
            }
            break;
          }
        }
      }
    });
  });

  // ---- Form Submission ----

  priorityForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const inputs = prioritiesList.querySelectorAll('.priority-input');
    const priorities = [];
    inputs.forEach(input => {
      const val = input.value.trim();
      if (val) priorities.push(val);
    });

    if (priorities.length === 0) {
      const firstInput = prioritiesList.querySelector('.priority-input');
      firstInput.focus();
      firstInput.closest('.priority-input-group').style.borderColor = '#e55';
      setTimeout(() => {
        firstInput.closest('.priority-input-group').style.borderColor = '';
      }, 2000);
      return;
    }

    showLoading(priorities);
  });

  // ---- Loading Simulation ----

  function showLoading(priorities) {
    inputSection.style.display = 'none';
    document.querySelector('.hero').style.display = 'none';
    loadingSection.style.display = 'flex';

    const steps = [
      'Analyzing priorities...',
      'Researching evidence-based habits...',
      'Cross-referencing behavioral science...',
      'Ranking by impact...',
      'Building your protocol...'
    ];

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < steps.length) {
        loadingStatus.textContent = steps[step];
      } else {
        clearInterval(interval);
        showProtocol(priorities);
      }
    }, 500);
  }

  // ---- Protocol Display ----

  function showProtocol(priorities) {
    const protocol = generateProtocol(priorities);

    loadingSection.style.display = 'none';
    outputSection.style.display = 'block';

    // Show matched categories
    matchedCategories.innerHTML = protocol.categories
      .map(cat => `<span class="matched-tag">${cat}</span>`)
      .join('');

    // Group habits by category
    const grouped = {};
    protocol.habits.forEach(habit => {
      if (!grouped[habit.category]) grouped[habit.category] = [];
      grouped[habit.category].push(habit);
    });

    // Render protocol list
    protocolList.innerHTML = '';
    let globalIndex = 0;

    for (const [category, habits] of Object.entries(grouped)) {
      const header = document.createElement('div');
      header.className = 'protocol-category-header';
      header.textContent = category;
      header.style.animationDelay = `${globalIndex * 0.05}s`;
      protocolList.appendChild(header);

      habits.forEach((habit, i) => {
        const item = createProtocolItem(habit, globalIndex);
        item.style.animationDelay = `${(globalIndex + 1) * 0.05}s`;
        protocolList.appendChild(item);
        globalIndex++;
      });
    }

    // Show synergies if any
    if (protocol.synergies.length > 0) {
      synergiesSection.style.display = 'block';
      synergiesList.innerHTML = protocol.synergies.map(syn => `
        <div class="synergy-card">
          <div class="synergy-title">${syn.title}</div>
          <div class="synergy-action">${syn.action}</div>
          <div class="synergy-source">${syn.source}</div>
        </div>
      `).join('');
    }

    // Scroll to output
    outputSection.scrollIntoView({ behavior: 'smooth' });

    // Store protocol for copy/download
    outputSection.dataset.protocol = formatProtocolText(protocol);
  }

  function createProtocolItem(habit, index) {
    const item = document.createElement('div');
    item.className = 'protocol-item';

    const impactClass = habit.impact >= 9 ? 'impact-high' : 'impact-medium';
    const impactLabel = habit.impact >= 9 ? 'High Impact' : 'Medium';
    const bars = Array.from({ length: 10 }, (_, i) =>
      `<span class="${i < habit.impact ? 'filled' : ''}"></span>`
    ).join('');

    item.innerHTML = `
      <div class="protocol-item-header">
        <input type="checkbox" class="protocol-checkbox" id="habit-${index}">
        <div class="protocol-item-main">
          <div class="protocol-item-top">
            <label class="protocol-item-title" for="habit-${index}">${habit.title}</label>
            <div class="protocol-impact ${impactClass}">
              <div class="impact-bar">${bars}</div>
              ${impactLabel}
            </div>
          </div>
          <div class="protocol-item-time">${habit.time}</div>
        </div>
        <div class="expand-indicator">&#9660;</div>
      </div>
      <div class="protocol-item-details">
        <div class="detail-row">
          <div class="detail-label">Action</div>
          <div class="detail-value">${habit.action}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Success Metric</div>
          <div class="detail-value">${habit.metric}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Trigger</div>
          <div class="detail-value">${habit.trigger}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Source</div>
          <div class="detail-value detail-source">${habit.source}</div>
        </div>
      </div>
    `;

    // Toggle expand
    const header = item.querySelector('.protocol-item-header');
    const checkbox = item.querySelector('.protocol-checkbox');

    header.addEventListener('click', (e) => {
      if (e.target === checkbox || e.target.tagName === 'LABEL') return;
      item.classList.toggle('expanded');
    });

    // Checkbox behavior
    checkbox.addEventListener('change', () => {
      item.classList.toggle('checked', checkbox.checked);
    });

    return item;
  }

  // ---- Format Protocol as Text ----

  function formatProtocolText(protocol) {
    let text = '═══════════════════════════════════════\n';
    text += '  PRAXIS — YOUR NON-NEGOTIABLE PROTOCOL\n';
    text += '═══════════════════════════════════════\n\n';
    text += `Generated: ${new Date().toLocaleDateString()}\n`;
    text += `Categories: ${protocol.categories.join(', ')}\n\n`;

    const grouped = {};
    protocol.habits.forEach(habit => {
      if (!grouped[habit.category]) grouped[habit.category] = [];
      grouped[habit.category].push(habit);
    });

    for (const [category, habits] of Object.entries(grouped)) {
      text += `\n── ${category.toUpperCase()} ──\n\n`;
      habits.forEach((habit, i) => {
        text += `${i + 1}. ${habit.title} [Impact: ${habit.impact}/10]\n`;
        text += `   When: ${habit.time}\n`;
        text += `   Action: ${habit.action}\n`;
        text += `   Metric: ${habit.metric}\n`;
        text += `   Trigger: ${habit.trigger}\n`;
        text += `   Source: ${habit.source}\n\n`;
      });
    }

    if (protocol.synergies.length > 0) {
      text += '\n── CROSS-CATEGORY SYNERGIES ──\n\n';
      protocol.synergies.forEach(syn => {
        text += `★ ${syn.title}\n`;
        text += `  ${syn.action}\n`;
        text += `  Source: ${syn.source}\n\n`;
      });
    }

    text += '\n═══════════════════════════════════════\n';
    text += '  Generated by PRAXIS\n';
    text += '  Science-backed. Impact-ranked. Actionable.\n';
    text += '═══════════════════════════════════════\n';

    return text;
  }

  // ---- Copy & Download ----

  copyBtn.addEventListener('click', () => {
    const text = outputSection.dataset.protocol;
    navigator.clipboard.writeText(text).then(() => {
      copyToast.classList.add('show');
      setTimeout(() => copyToast.classList.remove('show'), 2500);
    }).catch(() => {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      copyToast.classList.add('show');
      setTimeout(() => copyToast.classList.remove('show'), 2500);
    });
  });

  downloadBtn.addEventListener('click', () => {
    const text = outputSection.dataset.protocol;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `praxis-protocol-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // ---- Reset ----

  resetBtn.addEventListener('click', () => {
    outputSection.style.display = 'none';
    synergiesSection.style.display = 'none';
    document.querySelector('.hero').style.display = '';
    inputSection.style.display = '';

    // Clear inputs
    const groups = prioritiesList.querySelectorAll('.priority-input-group');
    groups.forEach((group, i) => {
      if (i === 0) {
        group.querySelector('.priority-input').value = '';
      } else {
        group.remove();
      }
    });
    updatePriorityNumbers();
    updateRemoveButtons();

    // Clear tag states
    document.querySelectorAll('.tag').forEach(tag => tag.classList.remove('active'));

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---- Enter key on inputs to add new priority ----

  prioritiesList.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('priority-input')) {
      e.preventDefault();
      if (e.target.value.trim()) {
        addPriorityBtn.click();
      }
    }
  });

})();
