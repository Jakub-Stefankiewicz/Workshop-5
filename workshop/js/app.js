document.addEventListener("DOMContentLoaded", function (){

const apikey="9e0d6bfd-4478-4627-88b7-6546a50038ff";
const apihost = 'https://todo-api.coderslab.pl';

function timerender(time){
    const hours=Math.floor(time/60);
    const minutes=time%60;
    return `${hours>0 ? `${hours}h` : ''}${minutes > 0 ? ` ${minutes}m` : ''}`;
}

function apiListTasks() {
    return fetch(
        apihost + '/api/tasks',
        {
            headers: { Authorization: apikey }
        }
    ).then(
        function(resp) {
            if(!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
            }
            return resp.json();
        }
    )
}

    function renderTask(taskId, title, description, status) {

        const section = document.createElement("section");
        section.className = 'card mt-5 shadow-sm';
        document.querySelector('main').appendChild(section);

        const headerDiv = document.createElement('div');
        headerDiv.className = 'card-header d-flex justify-content-between align-items-center';
        section.appendChild(headerDiv);

        const headerLeftDiv = document.createElement('div');
        headerDiv.appendChild(headerLeftDiv);

        const h5 = document.createElement('h5');
        h5.innerText = title;
        headerLeftDiv.appendChild(h5);

        const h6 = document.createElement('h6');
        h6.className = 'card-subtitle text-muted';
        h6.innerText = description;
        headerLeftDiv.appendChild(h6);

        const headerRightDiv = document.createElement('div');
        headerDiv.appendChild(headerRightDiv);

        if(status === 'open') {
            const finishButton = document.createElement('button');
            finishButton.className = 'btn btn-dark btn-sm js-task-open-only';
            finishButton.innerText = 'Finish';
            headerRightDiv.appendChild(finishButton);

            finishButton.addEventListener("click", function (ev){
                apiUpdateTask(taskId,title,description,status).then(function (operation){
                    console.log("test");
                    finishButton.remove();
                    section.querySelectorAll(".js-task-open-only").forEach(function (fx){
                        fx.remove();
                    })
                })
            })

        }

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-outline-danger btn-sm ml-2';
        deleteButton.innerText = 'Delete';
        headerRightDiv.appendChild(deleteButton);

        deleteButton.addEventListener("click", function (){
            apiDeleteTask(taskId).then( function (response){
                section.parentElement.removeChild(section);
                }
            )
        })




        const ul=document.createElement("ul");
        ul.className="list-group list-group-flush";
        section.appendChild(ul);
        apiListOperationsForTask(taskId).then(
            function (response){
                response.data.forEach(
                    function (operation){
                        renderOperation(ul, status, operation.id, operation.description, operation.timeSpent)
                    }
                )
            }
        )


        const divBody=document.createElement("div");
        divBody.className="card-body js-task-open-only";

        if(status===`open`) {
            section.appendChild(divBody);
            const form = document.createElement("form");
            divBody.appendChild(form);
            const divInput = document.createElement("div");
            divInput.className = "input-group";
            form.appendChild(divInput);
            const input2 = document.createElement("input");
            input2.type = "text";
            input2.placeholder = "Operation description";
            input2.className = "form-control";
            input2.minLength = "5";
            divInput.appendChild(input2);
            const divInputGroup = document.createElement("div");
            divInputGroup.className = "input-group-append";
            divInput.appendChild(divInputGroup);
            const buttonInput = document.createElement("button");
            buttonInput.className = "btn btn-info";
            buttonInput.innerText = "Add";
            divInputGroup.appendChild(buttonInput);

            buttonInput.addEventListener("click", function (ev) {
                if (input2.value.length < 6) {
                    alert("Długość zadania musi być większa niż 5 literek")
                } else {
                    apiCreateOperationForTask(taskId, input2.value).then(function (response) {
                        renderOperation(ul, status, response.data.id, response.data.description, response.data.timeSpent);
                    })
                }
                input2.value = null;
                ev.preventDefault();

            })
        }


    }

    function apiListOperationsForTask(taskId) {
        return fetch(
            apihost + `/api/tasks/` + taskId + `/operations`,
            {
                headers: { Authorization: apikey }
            }
        ).then(
            function(resp) {
                if(!resp.ok) {
                    alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
                }
                return resp.json();
            }
        );
    }


    function renderOperation(operationsList, status, operationId, operationDescription, timeSpent) {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        operationsList.appendChild(li);

        const descriptionDiv = document.createElement('div');
        descriptionDiv.innerText = operationDescription;
        li.appendChild(descriptionDiv);

        const time = document.createElement('span');
        time.className = 'badge badge-success badge-pill ml-2 js-task-open-only';
        time.innerText = timerender(timeSpent);

        const buttonsDiv=document.createElement("div");
        buttonsDiv.className="js-task-open-only";
        li.appendChild(buttonsDiv);

        const button15m=document.createElement("button");
        button15m.className="btn btn-outline-success btn-sm mr-2";
        button15m.innerText="+15m";


        const button1h=document.createElement("button");
        button1h.className="btn btn-outline-success btn-sm mr-2";
        button1h.innerText="+1h";


        const buttonDel=document.createElement("button")
        buttonDel.className="btn btn-outline-danger btn-sm";
        buttonDel.innerText="Delete";


        if (status===`open`){
            buttonsDiv.appendChild(button15m);
            buttonsDiv.appendChild(button1h);
            buttonsDiv.appendChild(buttonDel);
            descriptionDiv.appendChild(time);
        }

        button15m.addEventListener("click", function (){
            const time15min=timeSpent+15;
            apiUpdateOperation(operationId,operationDescription,time15min).then(function (operation){
                timeSpent=operation.data.timeSpent;
                time.innerText=timerender(operation.data.timeSpent);
            })
        })

        button1h.addEventListener("click", function (){
            const time60min=timeSpent+60;
            apiUpdateOperation(operationId,operationDescription,time60min).then(function (operation){
                timeSpent=operation.data.timeSpent;
                time.innerText=timerender(operation.data.timeSpent);
            })
        })

        buttonDel.addEventListener("click", function (){
            apiDeleteOperation(operationId).then(function (operation){
                li.remove();
            })
        })

    }

    apiListTasks().then(function (response){
        response.data.forEach(function (task){
            renderTask(task.id, task.title, task.description, task.status);
        })
    })

function apiCreateTask(title, description) {
    return fetch(
        apihost + '/api/tasks',
        {
            method: 'POST',
            headers: {
                'Authorization': apikey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: title, description: description, status: 'open' })
        }
    ).then(
        function(resp) {
            if(!resp.ok) {
                alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
            }
            return resp.json();
        }
    )
}

document.querySelector("form").addEventListener("submit", function (ev){

    const taskTitle=ev.currentTarget.elements.title.value;
    const taskDescription=ev.currentTarget.elements.description.value;
    apiCreateTask(taskTitle,taskDescription).then(function (response){
        renderTask(response.data.id, response.data.title, response.data.description, response.data.status);
    })
    ev.currentTarget.elements.title.value=null;
    ev.currentTarget.elements.description.value=null;    ev.preventDefault();
})

    function apiDeleteTask(taskId){
        return fetch(
            apihost + '/api/tasks/' + taskId,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': apikey,
                },
            }
        ).then(
            function(resp) {
                if(!resp.ok) {
                    alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
                }
                return resp.json();
            }
        )
    }

    function apiCreateOperationForTask(taskId, description){
        return fetch(
            apihost + '/api/tasks/' + taskId + '/operations',
            {
                method: 'POST',
                headers: {
                    'Authorization': apikey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({description: description, timeSpent: 0})
            }
        ).then(
            function(resp) {
                if(!resp.ok) {
                    alert('Wystąpił błąd w dodawaniu operacji! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
                }
                return resp.json();
            }
        )
    }

    function apiUpdateOperation(operationId, description, timeSpent){
        return fetch(
            apihost + '/api/operations/' + operationId,
            {
                method: 'PUT',
                headers: {
                    'Authorization': apikey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({description: description, timeSpent: timeSpent})
            }
        ).then(
            function(resp) {
                if(!resp.ok) {
                    alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
                }
                return resp.json();
            }
        )
    }

    function apiDeleteOperation(operationId){
        return fetch(
            apihost + '/api/operations/' + operationId,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': apikey,
                }
            }
        ).then(
            function(resp) {
                if(!resp.ok) {
                    alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
                }
                return resp.json();
            }
        )
    }

    function apiUpdateTask(taskId, title, description, status) {
        return fetch(
            apihost + '/api/tasks/' + taskId,
            {
                method: 'PUT',
                headers: {
                    'Authorization': apikey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: title, description: description, status: 'closed' })
            }
        ).then(
            function(resp) {
                if(!resp.ok) {
                    alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
                }
                return resp.json();
            }
        )
    }

})