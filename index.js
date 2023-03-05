"use strict"

const DOM = {
    taskForm: document.querySelector('#taskForm'),

    inputText: document.querySelector('#inputText'),
    inputTitle: document.querySelector('#inputTitle'),
    inputDate: document.querySelector('#inputDate'),
    inputTime: document.querySelector('#inputTime'),
    inputImportant: document.querySelector('#inputImportant'),
    inputStar: document.querySelector('#inputStar'),
    inputColorPicker: document.querySelector('#inputColorPicker'),
    addBtn: document.querySelector('#addBtn'),

    resetColorBtn: document.querySelector('#resetColorBtn'),
    tasksBox: document.querySelector('#tasksBox'),
    clearFormBtn: document.querySelector('#clearFormBtn'),

    filterImpBtn: document.querySelector('#filterImpBtn'),
    filterColorBtn: document.querySelector('#filterColorBtn'),
    filterAll: document.querySelector('#filterAll'),
}

const gTasks = JSON.parse(window.localStorage.getItem('tasks')) || []

init()













function init() {
    DOM.resetColorBtn.addEventListener('click', () => DOM.inputColorPicker.value = "#f8f8f8")

    DOM.addBtn.addEventListener('click', () => {
        const isValid = validateForm()
        if (!isValid) return
        addTask()
        renderTasks(gTasks, true)
        DOM.tasksBox.scrollIntoView({ behavior: "smooth", block: "end" })
        clearForm()
    })

    DOM.clearFormBtn.addEventListener('click', () => {
        clearForm()
    })

    DOM.inputImportant.addEventListener('change', () => {
        const starColor = DOM.inputImportant.checked ? "#FCD53F" : "#212529"
        DOM.inputStar.style.color = starColor
    })

    DOM.filterAll.addEventListener('click', () => {
        renderTasks(gTasks)
    })
    DOM.filterImpBtn.addEventListener('click', () => {
        const arr = filterImportant()
        renderTasks(arr)
    })
    DOM.filterColorBtn.addEventListener('click', () => {
        const arr = filterColored()
        renderTasks(arr)
    })

    renderTasks(gTasks)
}

function addTask() {
    const taskText = DOM.inputText.value
    const taskTitle = DOM.inputTitle.value
    const taskDate = DOM.inputDate.value
    const taskTime = DOM.inputTime.value
    const taskIsImportant = DOM.inputImportant.checked
    const taskColor = DOM.inputColorPicker.value

    const task = new Task(taskText, taskTitle, taskDate, taskTime, taskIsImportant, taskColor)

    gTasks.push(task)
    window.localStorage.setItem('tasks', JSON.stringify(gTasks))
}

function renderTasks(arrOfTasks = gTasks, isLastAnimated = false) {
    if (!Array.isArray(arrOfTasks)) return
    if (arrOfTasks.length === 0) {
        printEmpty()
        return
    }

    DOM.tasksBox.innerHTML = ""
    arrOfTasks.forEach((task, i) => {
        i === (arrOfTasks.length - 1) ? printCard(task, isLastAnimated) : printCard(task)
    })


    function printEmpty() {
        if (arrOfTasks.length !== 0) return
        DOM.tasksBox.innerHTML = ""
        const card = document.createElement("div")
        card.classList.add("card", "text-bg-dark", "text-center", "fw-bold", "w-100", "p-3")
        card.innerText = "Oops! No tasks to show yet..."

        DOM.tasksBox.append(card)
        return
    }

    function printCard(task, isAnimated = false) {
        const col = document.createElement("div")
        col.classList.add("col")
        if (isAnimated) {
            col.style.opacity = 0
            col.style.animation = "newTaskAnim 1s linear 1s normal forwards"
        }

        const card = document.createElement("div")
        card.classList.add("card", "position-relative", "shadow-sm")

        const btnBox = getHoverBtnBox(task)
        const cardBody = getCardBody(task)
        const cardFooter = getCardFooter(task)
        const cardHeader = getCardHeader(task)
        card.append(btnBox, cardHeader, cardBody, cardFooter)

        col.append(card)
        DOM.tasksBox.append(col)



        function getHoverBtnBox(task) {
            const box = document.createElement("div")
            box.style.position = "absolute"
            box.style.top = "10px"
            box.style.right = "10px"
            const deleteBtn = document.createElement("button")
            deleteBtn.classList.add("btn", "btn-sm", "btn-dark")
            deleteBtn.innerHTML = `<ion-icon name="trash"></ion-icon>`
            deleteBtn.title = "Delete Task"
            deleteBtn.addEventListener('click', () => {
                deleteTask(task.id)
                renderTasks(arrOfTasks)
            })
            box.append(deleteBtn)
            return box
        }

        function getCardHeader(task) {
            const header = document.createElement("div")
            header.classList.add("card-header", "position-relative")
            header.style.isolation = "isolate"
            header.style.pointerEvents = "none"

            const taskTitle = document.createElement("h5")
            taskTitle.classList.add("card-header", "border", "rounded", "mb-2", "position-relative")
            // taskTitle.style.backgroundColor = task.color + "99" //improved:
            const hslArr = hexToHSL(task.color, true)
            taskTitle.style.backgroundColor = `hsla(${hslArr[0]},${hslArr[1]}%,${hslArr[2]}%,0.7)`
            taskTitle.style.width = "fit-content"
            const formattedTitle = task.title.length > 10 ? task.title.substring(0, 10).concat('...') : task.title
            taskTitle.innerText = formattedTitle || "No Title"

            // important star badge
            if (task.isImportant) {
                const importantBadge = document.createElement("span")
                importantBadge.classList.add("position-absolute", "top-0", "start-100", "translate-middle", "badge", "rounded-pill", "bg-warning", "shadow-sm")
                importantBadge.innerHTML = `<ion-icon name="star"></ion-icon>`

                taskTitle.append(importantBadge)
            }

            const coloredPin = getSvgPin(task.color)

            header.append(taskTitle, coloredPin)

            return header
        }

        function getCardBody(task) {
            const body = document.createElement("div")
            body.classList.add("card-body", "task-main")
            const cardText = document.createElement("p")
            cardText.classList.add("card-text")
            cardText.innerText = task.text
            body.append(cardText)
            return body

        }

        function getCardFooter(task) {
            const footer = document.createElement("div")
            footer.classList.add("card-footer")
            const pDate = document.createElement("p")
            pDate.classList.add("h6", "m-0")
            pDate.innerText = getFormattedDate(task.date) || "No date"
            const pTime = document.createElement("p")
            pTime.classList.add("h6", "m-0")
            pTime.innerText = task.time || "No time defined"
            footer.append(pDate, pTime)
            return footer
        }

        function getSvgPin(color) {
            if (!color) return
            const hslArray = hexToHSL(color, true)
            const hue = hslArray[0]
            const colors = [`hsl(${hue}, 29%, 28%)`, `hsl(${hue}, 56%, 53%)`, `hsl(${hue}, 72%, 59%)`, `hsl(${hue}, 72%, 67%)`,]
            const svgSTR = `<svg height="45px" width="45px" transform="rotate(30)" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 280.028 280.028" xml:space="preserve" fill="#000000">

            <g id="SVGRepo_bgCarrier" stroke-width="0"/>
            
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
            
            <g id="SVGRepo_iconCarrier"> <g> <path style="fill:${colors[0]};" d="M131.263,131.263v140.014c0,4.839,3.912,8.751,8.751,8.751s8.751-3.912,8.751-8.751V131.263H131.263 z"/> <path style="fill:${colors[2]};" d="M140.014,0c48.331,0,87.509,39.186,87.509,87.509s-39.178,87.517-87.509,87.517 c-48.322,0.009-87.509-39.195-87.509-87.517S91.691,0,140.014,0z"/> <path style="fill:${colors[3]};" d="M166.266,43.763c14.5,0,26.253,11.744,26.253,26.244S180.767,96.26,166.266,96.26 c-14.491,0-26.253-11.752-26.253-26.253C140.014,55.515,151.775,43.763,166.266,43.763z"/> <path style="fill:${colors[1]};" d="M148.765,166.284c-48.313,0-87.509-39.204-87.509-87.526c0-21.938,8.13-41.934,21.466-57.292 C64.24,37.524,52.505,61.125,52.505,87.509c0,48.322,39.186,87.517,87.509,87.517c26.393,0,49.994-11.744,66.043-30.217 C190.699,158.163,170.703,166.284,148.765,166.284z"/> </g> </g>
            
            </svg>`
            const pin = document.createElement("div")
            pin.innerHTML = svgSTR
            pin.style.position = "absolute"
            pin.style.top = "-30px"
            pin.style.left = "50%"

            pin.style.zIndex = "-1"

            return pin
        }

    }

}

function deleteTask(idToDelete) {
    if (typeof (idToDelete) !== 'string') return
    const indexToDelete = gTasks.findIndex(task => task.id === idToDelete)
    if (indexToDelete !== -1) {
        gTasks.splice(indexToDelete, 1)
        window.localStorage.setItem('tasks', JSON.stringify(gTasks))
    }

}

function getFormattedDate(inputStr) {
    // expects: inputStr = '2023-02-13'
    if (!inputStr) return

    let [year, month, day] = inputStr.split('-');

    switch (month) {
        case '01':
            month = 'Jan'
            break;
        case '02':
            month = 'Feb'
            break;
        case '03':
            month = 'Mar'
            break;
        case '04':
            month = 'Apr'
            break;
        case '05':
            month = 'May'
            break;
        case '06':
            month = 'Jun'
            break;
        case '07':
            month = 'Jul'
            break;
        case '08':
            month = 'Aug'
            break;
        case '09':
            month = 'Sep'
            break;
        case '10':
            month = 'Oct'
            break;
        case '11':
            month = 'Nov'
            break;
        case '12':
            month = 'Dec'

    }

    switch (day) {
        case '1':
        case '21':
        case '31':
            day += 'st'
            break;
        case '2':
        case '22':
            day += 'nd'
            break;
        case '3':
        case '23':
            day += 'rd'
            break;

        default:
            day += 'th'
    }

    const date = `${month} ${day} - ${year}`;
    return date
}

function filterImportant() {
    return gTasks.filter(task => task.isImportant)
}

function filterColored() {
    return gTasks.filter(task => task.color !== "#f8f8f8")
}

function validateForm() {
    const taskText = DOM.inputText
    const taskDate = DOM.inputDate
    const taskTime = DOM.inputTime
    const animStr = "inputErrorAnim 1000ms ease 0s 1 normal forwards"
    const boxShadowStr = "0px 0px 0px 2px #F01F1F"
    const transitionStr = "box-shadow 500ms"

    if (!taskText.value) {
        handleError(taskText)
        return false
    } else if (!taskDate.value) {
        handleError(taskDate)
        return false
    } else if (!taskTime.value) {
        handleError(taskTime)
        return false
    }

    function handleError(elmInput) {
        elmInput.style.transition = transitionStr
        elmInput.style.boxShadow = boxShadowStr
        elmInput.style.animation = animStr
        setTimeout(() => {
            elmInput.style.animation = "none";
        }, 1000)
        elmInput.oninput = () => { elmInput.style.boxShadow = "none" }
    }

    return true
}

function clearForm() {
    DOM.taskForm.reset()
    DOM.inputStar.style.color = "#212529"
    DOM.inputText.style.boxShadow = "none"
    DOM.inputDate.style.boxShadow = "none"
    DOM.inputTime.style.boxShadow = "none"
}

function hexToHSL(Hex, isGetArrHSL = false) {
    // Convert hex to RGB first
    let r = 0,
        g = 0,
        b = 0;
    if (Hex.length == 4) {
        r = "0x" + Hex[1] + Hex[1];
        g = "0x" + Hex[2] + Hex[2];
        b = "0x" + Hex[3] + Hex[3];
    } else if (Hex.length == 7) {
        r = "0x" + Hex[1] + Hex[2];
        g = "0x" + Hex[3] + Hex[4];
        b = "0x" + Hex[5] + Hex[6];
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0)
        h = 0;
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    else if (cmax == g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    if (isGetArrHSL) return [h, s, l]
    return "hsl(" + h + "," + s + "%," + l + "%)";
}
