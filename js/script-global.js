let nbChoix = 0;
let totalQuestions = 0;
let displayMode = "literal";
let questionsData = [];
let qcmTitle = "";
let totalPoints = 0;

const champsTouches = {
    qcmTitle: false,
    nbQuestions: false,
    nbChoix: false
};

function marquerChampCommeTouche(id) {
    const valeur = document.getElementById(id).value.trim();
    if (valeur !== "") {
        champsTouches[id] = true;
    }
}

function lireNombre(id) {
    const valeur = document.getElementById(id).value;
    if (valeur === "") return NaN;
    return parseInt(valeur, 10);
}

function afficherErreur(id, message) {
    document.getElementById(id).innerText = message;
}

function validerSetup(afficherMessages = true) {
    const nbQ = lireNombre("nbQuestions");
    const nbC = lireNombre("nbChoix");
    const titre = document.getElementById("qcmTitle").value.trim();

    let estValide = true;
    let erreurTitre = "";
    let erreurNbQ = "";
    let erreurNbC = "";

    if (titre === "") {
        erreurTitre = "Entrez un titre pour ce QCM.";
        estValide = false;
    }

    if (isNaN(nbQ) || nbQ <= 0) {
        erreurNbQ = "Entrez un nombre de questions valide (minimum 1).";
        estValide = false;
    }

    if (isNaN(nbC) || nbC <= 0) {
        erreurNbC = "Entrez un nombre de choix valide (minimum 1).";
        estValide = false;
    }

    if (afficherMessages) {
        afficherErreur("errorQcmTitle", champsTouches.qcmTitle ? erreurTitre : "");
        afficherErreur("errorNbQuestions", champsTouches.nbQuestions ? erreurNbQ : "");
        afficherErreur("errorNbChoix", champsTouches.nbChoix ? erreurNbC : "");
    }

    return estValide;
}

function mettreAJourEtatSetup() {
    document.getElementById("startBtn").disabled = !validerSetup(false);
}

function toAlphabetLabel(index) {
    let value = index;
    let label = "";

    while (value > 0) {
        const remainder = (value - 1) % 26;
        label = String.fromCharCode(65 + remainder) + label;
        value = Math.floor((value - 1) / 26);
    }

    return label;
}

function getChoiceLabel(index) {
    if (displayMode === "numeric") {
        return String(index);
    }

    return toAlphabetLabel(index);
}

function creerOptionCheckbox(name, value, text, questionIndex) {
    const item = document.createElement("label");
    item.className = "choice-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = name;
    checkbox.value = String(value);
    checkbox.dataset.questionIndex = questionIndex;

    const span = document.createElement("span");
    span.innerText = text;

    item.appendChild(checkbox);
    item.appendChild(span);

    return item;
}

function initialiserValidationTempsReel() {
    ["qcmTitle", "nbQuestions", "nbChoix"].forEach((id) => {
        document.getElementById(id).addEventListener("input", () => {
            marquerChampCommeTouche(id);
            mettreAJourEtatSetup();
            validerSetup(true);
        });
    });

    document.getElementById("displayMode").addEventListener("change", () => {
        mettreAJourEtatSetup();
    });

    mettreAJourEtatSetup();
}

function startQCM() {
    if (!validerSetup(true)) {
        return;
    }

    qcmTitle = document.getElementById("qcmTitle").value.trim();
    totalQuestions = lireNombre("nbQuestions");
    nbChoix = lireNombre("nbChoix");
    displayMode = document.getElementById("displayMode").value;
    totalPoints = 0;

    // Initialiser les données des questions
    questionsData = [];
    for (let i = 0; i < totalQuestions; i++) {
        questionsData.push({
            userAnswers: [],
            officialAnswers: []
        });
    }

    document.getElementById("setup").classList.add("hidden");
    document.getElementById("qcm").classList.remove("hidden");

    afficherQuestions();
}

function afficherQuestions() {
    const container = document.getElementById("questionsContainer");
    container.innerHTML = "";

    for (let q = 0; q < totalQuestions; q++) {
        const questionBlock = document.createElement("div");
        questionBlock.className = "question-block";

        const title = document.createElement("h3");
        title.innerText = "Question " + (q + 1);
        questionBlock.appendChild(title);

        // Section réponses utilisateur
        const userLabel = document.createElement("p");
        userLabel.style.fontWeight = "600";
        userLabel.style.color = "var(--text)";
        userLabel.innerText = "Vos réponses :";
        questionBlock.appendChild(userLabel);

        const userAnswersDiv = document.createElement("div");
        userAnswersDiv.className = "choices-grid";
        userAnswersDiv.id = "userAnswers-" + q;

        for (let i = 1; i <= nbChoix; i++) {
            const label = getChoiceLabel(i);
            userAnswersDiv.appendChild(creerOptionCheckbox("userAnswer-" + q, i, label, q));
        }
        questionBlock.appendChild(userAnswersDiv);

        // Section correction
        const officialLabel = document.createElement("p");
        officialLabel.style.fontWeight = "600";
        officialLabel.style.color = "var(--text)";
        officialLabel.style.marginTop = "12px";
        officialLabel.innerText = "Bonnes réponses (correction) :";
        questionBlock.appendChild(officialLabel);

        const officialAnswersDiv = document.createElement("div");
        officialAnswersDiv.className = "choices-grid";
        officialAnswersDiv.id = "officialAnswers-" + q;

        for (let i = 1; i <= nbChoix; i++) {
            const label = getChoiceLabel(i);
            officialAnswersDiv.appendChild(creerOptionCheckbox("officialAnswer-" + q, i, label, q));
        }
        questionBlock.appendChild(officialAnswersDiv);

        container.appendChild(questionBlock);
    }

    afficherErreur("errorQuestion", "");
    document.getElementById("validerBtn").disabled = false;
}

function getSelectedValuesForQuestion(containerId) {
    const container = document.getElementById(containerId);
    const checkboxes = container.querySelectorAll("input[type='checkbox']:checked");
    return Array.from(checkboxes).map((checkbox) => parseInt(checkbox.value, 10));
}

function validerToutesQuestions() {
    for (let q = 0; q < totalQuestions; q++) {
        const selectedOfficial = getSelectedValuesForQuestion("officialAnswers-" + q);

        if (selectedOfficial.length === 0) {
            return false;
        }
    }

    return true;
}

function validerQCM() {
    if (!validerToutesQuestions()) {
        afficherErreur("errorQuestion", "Vous devez cocher au moins une bonne réponse pour chaque question.");
        return;
    }

    afficherErreur("errorQuestion", "");

    // Sauvegarder les réponses
    for (let q = 0; q < totalQuestions; q++) {
        questionsData[q].userAnswers = getSelectedValuesForQuestion("userAnswers-" + q);
        questionsData[q].officialAnswers = getSelectedValuesForQuestion("officialAnswers-" + q);
    }

    afficherResultats();
}

function calculerPointsQuestion(userAnswers, officialAnswers) {
    if (officialAnswers.length === 0) return 0;

    const bonnes = officialAnswers.length;
    const officialSet = new Set(officialAnswers);

    let correctes = 0;
    let fausses = 0;

    userAnswers.forEach((value) => {
        if (officialSet.has(value)) {
            correctes++;
        } else {
            fausses++;
        }
    });

    const count_point_response_question = 1 / bonnes;

    let point_response = 0;
    point_response += correctes * count_point_response_question;
    point_response -= fausses * count_point_response_question;

    if (point_response < 0) point_response = 0;
    if (point_response > 1) point_response = 1;

    return point_response;
}

function afficherResultats() {
    document.getElementById("qcm").classList.add("hidden");
    document.getElementById("resultFinal").classList.remove("hidden");

    const correctionContainer = document.getElementById("correctionContainer");
    correctionContainer.innerHTML = "";

    totalPoints = 0;

    for (let q = 0; q < totalQuestions; q++) {
        const userAnswers = questionsData[q].userAnswers;
        const officialAnswers = questionsData[q].officialAnswers;
        const points = calculerPointsQuestion(userAnswers, officialAnswers);

        totalPoints += points;

        const questionBlock = document.createElement("div");
        questionBlock.className = "question-block";

        const title = document.createElement("h3");
        title.innerText = "Question " + (q + 1);
        questionBlock.appendChild(title);

        // Réponses de l'utilisateur
        const userLabel = document.createElement("p");
        userLabel.style.fontWeight = "600";
        userLabel.style.color = "var(--text)";
        userLabel.innerText = "Vos réponses :";
        questionBlock.appendChild(userLabel);

        const userAnswersDiv = document.createElement("div");
        userAnswersDiv.className = "choices-grid";

        for (let ans of userAnswers) {
            const span = document.createElement("span");
            span.className = "choice-item";
            span.style.pointerEvents = "none";
            span.innerText = getChoiceLabel(ans);
            userAnswersDiv.appendChild(span);
        }

        if (userAnswers.length === 0) {
            const span = document.createElement("span");
            span.style.color = "var(--muted)";
            span.innerText = "Aucune réponse";
            userAnswersDiv.appendChild(span);
        }

        questionBlock.appendChild(userAnswersDiv);

        // Bonnes réponses
        const officialLabel = document.createElement("p");
        officialLabel.style.fontWeight = "600";
        officialLabel.style.color = "var(--text)";
        officialLabel.style.marginTop = "12px";
        officialLabel.innerText = "Bonnes réponses (correction) :";
        questionBlock.appendChild(officialLabel);

        const officialAnswersDiv = document.createElement("div");
        officialAnswersDiv.className = "choices-grid";

        for (let ans of officialAnswers) {
            const span = document.createElement("span");
            span.className = "choice-item";
            span.style.pointerEvents = "none";
            span.style.background = "#d4edda";
            span.innerText = getChoiceLabel(ans);
            officialAnswersDiv.appendChild(span);
        }

        questionBlock.appendChild(officialAnswersDiv);

        // Points de la question
        const pointsLabel = document.createElement("p");
        pointsLabel.style.fontWeight = "600";
        pointsLabel.style.color = points >= 0.5 ? "var(--primary)" : "var(--error)";
        pointsLabel.style.marginTop = "12px";
        pointsLabel.innerText = "Points : " + points.toFixed(2) + " / 1";
        questionBlock.appendChild(pointsLabel);

        correctionContainer.appendChild(questionBlock);
    }

    const noteSur20 = (totalPoints / totalQuestions) * 20;

    document.getElementById("noteFinale").innerText =
        "Note finale : " + noteSur20.toFixed(2) + " / 20";
}

function telechargerPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    // Fonction utile pour ajouter du texte avec saut de ligne
    function addText(text, fontSize = 12, fontWeight = 'normal', color = '#000000') {
        doc.setFontSize(fontSize);
        doc.setFont(undefined, fontWeight === 'bold' ? 'bold' : 'normal');
        doc.setTextColor(parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16));

        const lines = doc.splitTextToSize(text, pageWidth - 20);
        doc.text(lines, 10, yPosition);
        yPosition += lines.length * 7;
    }

    function checkPageBreak(minHeight = 30) {
        if (yPosition + minHeight > pageHeight - 10) {
            doc.addPage();
            yPosition = 15;
        }
    }

    // En-tête
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    const titleLines = doc.splitTextToSize(qcmTitle, pageWidth - 20);
    doc.text(titleLines, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += titleLines.length * 8 + 5;

    // Date
    const today = new Date().toLocaleDateString('fr-FR');
    addText('Date : ' + today, 11, 'normal', '#666666');
    yPosition += 3;

    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(10, yPosition, pageWidth - 10, yPosition);
    yPosition += 8;

    // Score final (encadré)
    checkPageBreak(20);
    const noteSur20 = (totalPoints / totalQuestions) * 20;
    const scoreText = 'Note finale : ' + noteSur20.toFixed(2) + ' / 20';

    doc.setDrawColor(0, 113, 227);
    doc.setLineWidth(1);
    doc.rect(10, yPosition, pageWidth - 20, 15);

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 113, 227);
    doc.text(scoreText, pageWidth / 2, yPosition + 10, { align: 'center' });
    yPosition += 22;

    // Questions
    for (let q = 0; q < totalQuestions; q++) {
        checkPageBreak(30);

        const userAnswers = questionsData[q].userAnswers;
        const officialAnswers = questionsData[q].officialAnswers;
        const points = calculerPointsQuestion(userAnswers, officialAnswers);

        // Titre de la question
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Question ' + (q + 1), 10, yPosition);
        yPosition += 8;

        // Réponses de l'utilisateur
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Vos réponses :', 12, yPosition);
        yPosition += 6;

        doc.setFont(undefined, 'normal');
        if (userAnswers.length === 0) {
            doc.setTextColor(150, 150, 150);
            doc.text('Aucune réponse', 15, yPosition);
        } else {
            const userAnswersText = userAnswers.map(ans => getChoiceLabel(ans)).join(', ');
            const userLines = doc.splitTextToSize(userAnswersText, pageWidth - 25);
            doc.setTextColor(0, 0, 0);
            doc.text(userLines, 15, yPosition);
            yPosition += userLines.length * 5;
        }
        yPosition += 5;

        // Bonnes réponses
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Bonnes réponses :', 12, yPosition);
        yPosition += 6;

        doc.setFont(undefined, 'normal');
        const officialAnswersText = officialAnswers.map(ans => getChoiceLabel(ans)).join(', ');
        const officialLines = doc.splitTextToSize(officialAnswersText, pageWidth - 25);
        doc.setTextColor(76, 175, 80);
        doc.text(officialLines, 15, yPosition);
        yPosition += officialLines.length * 5;
        yPosition += 5;

        // Points
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        const pointColor = points >= 0.5 ? '#0071e3' : '#b00020';
        doc.setTextColor(
            parseInt(pointColor.slice(1, 3), 16),
            parseInt(pointColor.slice(3, 5), 16),
            parseInt(pointColor.slice(5, 7), 16)
        );
        doc.text('Points : ' + points.toFixed(2) + ' / 1', 12, yPosition);
        yPosition += 10;

        // Séparateur entre questions
        if (q < totalQuestions - 1) {
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.5);
            doc.line(12, yPosition, pageWidth - 12, yPosition);
            yPosition += 8;
        }
    }

    // Télécharger le PDF
    const filename = qcmTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf';
    doc.save(filename);
}

function resetQCM() {
    totalQuestions = 0;
    nbChoix = 0;
    displayMode = "literal";
    questionsData = [];
    qcmTitle = "";
    totalPoints = 0;

    document.getElementById("qcmTitle").value = "";
    document.getElementById("nbQuestions").value = "";
    document.getElementById("nbChoix").value = "";
    document.getElementById("displayMode").value = "literal";

    document.getElementById("resultFinal").classList.add("hidden");
    document.getElementById("qcm").classList.add("hidden");
    document.getElementById("setup").classList.remove("hidden");

    champsTouches.qcmTitle = false;
    champsTouches.nbQuestions = false;
    champsTouches.nbChoix = false;

    afficherErreur("errorQcmTitle", "");
    afficherErreur("errorNbQuestions", "");
    afficherErreur("errorNbChoix", "");
    afficherErreur("errorQuestion", "");

    mettreAJourEtatSetup();
}

initialiserValidationTempsReel();

