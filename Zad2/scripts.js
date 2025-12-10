"use strict"

let todoList = [];
<<<<<<< HEAD
const GROQ_API = GROQ_API_KEY;
=======
const GROQ_API = "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";
>>>>>>> 31d6324a345c7aa3030bff5c49fe61265ee7ed8b
const x_master_key = "$2a$10$tccNxdVY6umQcRTgT9VhwurGKEnS75GK5EsvcW/c8kIkKxzNyKLQK";

// let initList = function() {
//     let savedList = window.localStorage.getItem("todos");
//         if (savedList != null)
//             todoList = JSON.parse(savedList);
//         else

//     //code creating a default list with 2 items
//     todoList.push(
//         {
//             title: "Learn JS",
//             description: "Create a demo application for my TODO's",
//             place: "445",
//             category: '',
//             dueDate: new Date(2024,10,16)
//         },
//         {
//             title: "Lecture test",
//             description: "Quick test from the first three lectures",
//             place: "F6",
//             category: '',
//             dueDate: new Date(2024,10,17)
//         }
//         // of course the lecture test mentioned above will not take place
//     );
// }

// initList();

let req = new XMLHttpRequest();

req.onreadystatechange = () => {
    if (req.readyState == XMLHttpRequest.DONE) {
        // console.log(req.responseText);
        todoList = JSON.parse(req.responseText).record;
        updateTable();
    }
};


req.open("GET", "https://api.jsonbin.io/v3/b/68e791be43b1c97be9600143/latest", true);
req.setRequestHeader("X-Master-Key", x_master_key);
req.send();

let updateJSONbin = function() {
    let upReq = new XMLHttpRequest();

    upReq.onreadystatechange = () => {
        if(upReq.readyState == XMLHttpRequest.DONE) {
            console.log(upReq.responseText);
        }
    };

    upReq.open("PUT", "https://api.jsonbin.io/v3/b/68e791be43b1c97be9600143", true);
    upReq.setRequestHeader("Content-Type", "application/json");
    upReq.setRequestHeader("X-Master-Key", x_master_key);
    upReq.send(JSON.stringify(todoList));
}

// let updateTodoList = function() {
//     //add all elements
//     let todoListDiv =
//     document.getElementById("todoListView");

//     //remove all elements
//     while (todoListDiv.firstChild) {
//         todoListDiv.removeChild(todoListDiv.firstChild);
//     }

//     //add all elements
//     for (let todo in todoList) {
//         let newElement = document.createElement("div");
//         /*
//         let newDeleteButton = document.createElement("input");
//         newDeleteButton.type = "button";
//         newDeleteButton.value = "x";
//         newDeleteButton.addEventListener("click", function() {
//             deleteTodo(todo);
//         });
        
//         let newContent = document.createTextNode(
//             todoList[todo].title + " " + todoList[todo].description);

//         newElement.appendChild(newDeleteButton);
//         newElement.appendChild(newContent);
//         todoListDiv.appendChild(newElement); 
//         */
//     }

//     let filterInput = document.getElementById("inputSearch");   
//     for (let todo in todoList) {
//         if (
//             (filterInput.value == "") ||
//             (todoList[todo].title.includes(filterInput.value)) ||
//             (todoList[todo].description.includes(filterInput.value))
//         ) {
//             let newElement = document.createElement("p");
//             let newContent = document.createTextNode(todoList[todo].title + " " +todoList[todo].description);
//             newElement.appendChild(newContent);
//             todoListDiv.appendChild(newElement);
//         }
//     }
// }
// setInterval(updateTodoList, 1000);

let deleteTodo = function(index) {
    todoList.splice(index,1);
    updateJSONbin();
    updateTable();
}

let addTodo = async function() {
  //get the elements in the form
    let inputTitle = document.getElementById("inputTitle");
    let inputDescription = document.getElementById("inputDescription");
    let inputPlace = document.getElementById("inputPlace");
    let inputDate = document.getElementById("inputDate");
  //get the values from the form
    let newTitle = inputTitle.value;
    let newDescription = inputDescription.value;
    let newPlace = inputPlace.value;
    let newDate = new Date(inputDate.value);
    let category = await categoryGetter(newTitle,newDescription)
  //create new item
    let newTodo = {
        title: newTitle,
        description: newDescription,
        place: newPlace,
        category: category,
        dueDate: newDate
    };
  //add item to the list
    todoList.push(newTodo);
    updateJSONbin();
    updateTable();
    window.localStorage.setItem("todos", JSON.stringify(todoList));
}

let updateTable = function() {
    const searchInput = document.getElementById("inputSearch").value;
    const toDateValue = document.getElementById("toDate").value;
    const fromDateValue = document.getElementById("fromDate").value;

    const fromDate = fromDateValue ? new Date(fromDateValue) : null;
    const toDate = toDateValue ? new Date(toDateValue) : null;
    
    const filteredList = todoList.filter(todo => checkTable(todo, searchInput, fromDate, toDate));

    showTable(filteredList);
}

let checkTable = function(todo, searchInput, fromDate, toDate) {
    let dueDate = new Date(todo.dueDate);
    if ((fromDate && dueDate < fromDate) || (toDate && dueDate > toDate)) {
        return false;
    }

    if(todo.title.toLowerCase().includes(searchInput.toLowerCase()) || todo.description.toLowerCase().includes(searchInput.toLowerCase()) || searchInput === "") {
        return true;
    } else {
        return false;
    }
}

let showTable = function(filteredList) {
    const column = ['title', 'description', 'category', 'place', 'date'];
    let bodyTags = '';
    for(let i=0; i<filteredList.length; i++) {
        const todo = filteredList[i];
        const ind = todoList.indexOf(todo);
        bodyTags += `
        <tr>
            <td>${todo.title}</td>
            <td>${todo.description}</td>
            <td>${todo.category}</td>
            <td>${todo.place}</td>
            <td>${new Date(todo.dueDate).toLocaleDateString()}</td>
            <td><input id="deleteButtons" type="button" value="x" onclick="deleteTodo(${ind})"></td>
        </tr>`;
    }   

    if (bodyTags === '') {
        document.querySelector('thead').innerHTML = '';
        document.querySelector('tbody').innerHTML = '<tr><td colspan="6">No matches</td></tr>';
    } else {
        let headTags = '<tr>';
        for (let i = 0; i < column.length; i++) {
            headTags += `<th>${column[i]}</th>`;
        }
        headTags += `<th>Delete</th></tr>`;

        document.querySelector('thead').innerHTML = headTags;
        document.querySelector('tbody').innerHTML = bodyTags;
    }
}


async function categoryGetter(title, desc) {
    const prompt = `Tytuł: ${title}, Opis: ${desc}. 
    Na podstawie podanego tytułu oraz opisu zadania podaj kategorię:
    "uczelnia" (zadania o nauce, studiach, projektach, egzaminach itp.) lub "prywatne" (zadania zwiazane z zyciem osobistym, hobby itp.)
    Odpowiedz tylko i wyłącznie słowem "uczelnia" lub "prywatne".
    `

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [{
                    role: "user",
                    content: prompt,
                },],
                model: "openai/gpt-oss-20b"
            })
        })
        let data = await response.json()
        let category = "prywatne";

        if(response.ok) {
            category = data.choices[0]?.message?.content.trim().toLowerCase();;
            return category;
        }  
    } catch (error) { 
        console.error("Błąd komunikacji z API", error);
        return "prywatne"
    }
    return "prywatne"
}