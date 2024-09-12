// GET
async function functionGETdata(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Datos recibidos:', data);
        displayTasks(data);
        return data;
    } catch (error) {
        console.error('Error en functionGET:', error);
        throw error;
    }
}

// PUT
async function functionPUTdata(taskId, newStatus) {
    const url = `http://localhost:3000/api/tasks/${taskId}`;
    const payload = { status: newStatus };

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
}

// Mostrar tareas en la pantalla
function displayTasks(tasks) {
    console.log('Mostrando tareas:', tasks);
    
    const taskContainers = {
        'backlog': document.getElementById('backlog'),
        'to-do': document.getElementById('to-do'),
        'in-progress': document.getElementById('in-progress'),
        'blocked': document.getElementById('blocked'),
        'done': document.getElementById('done')
    };

    // Limpia las tarjetas actuales antes de mostrar nuevas
    Object.values(taskContainers).forEach(container => {
        container.querySelector('.task-list-content').innerHTML = '';
    });

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'box mb-3';
        taskElement.draggable = true;
        taskElement.setAttribute('data-id', task.id);

        taskElement.innerHTML = `
            <h2 class="title is-5">${task.title}</h2>
            <p>${task.description}</p>
            <p><strong>Asignado:</strong> ${task.assignedTo}</p>
            <p><strong>Prioridad:</strong> ${task.priority}</p>
            <p><strong>Fecha Límite:</strong> ${task.endDate}</p>
        `;

        taskElement.addEventListener('dragstart', dragStart);
        taskElement.addEventListener('dragend', dragEnd);

        const container = taskContainers[task.status];
        if (container) {
            container.querySelector('.task-list-content').appendChild(taskElement);
        } else {
            console.error('Contenedor no encontrado para el estado:', task.status);
        }
    });
}

function allowDrop(event) {
    event.preventDefault(); 
}

// Drag
function dragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.getAttribute('data-id'));
}

function dragEnd(event) {
    event.dataTransfer.clearData();
}

// Drop
async function drop(event) {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain');
    const taskElement = document.querySelector(`[data-id="${id}"]`);

    const container = event.target.closest('.task-list-content');
    
    if (container) {
        container.appendChild(taskElement);

        const newStatus = container.parentElement.id;
        
        try {
            await functionPUTdata(id, newStatus);
            console.log(`Tarea ${id} movida a ${newStatus}`);
        } catch (error) {
            console.error('Error al actualizar el estado de la tarea:', error);
        }
    }
}

// Agregar una nueva tarea
async function addTask() {
    const newTask = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        assignedTo: document.getElementById('assignedTo').value,
        priority: document.getElementById('priority').value,
        endDate: document.getElementById('endDate').value,
        status: document.getElementById('status').value
    };

    const url = 'http://localhost:3000/api/tasks/'; 

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTask)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Tarea agregada:', data);
        
        // Limpiar campos después de agregar la tarea
        document.getElementById('title').value = '';
        document.getElementById('description').value = '';
        document.getElementById('assignedTo').value = '';
        document.getElementById('priority').value = '';
        document.getElementById('endDate').value = '';
        document.getElementById('status').value = '';

        // Ocultar el modal después de agregar la tarea
        document.getElementById('task-modal').style.display = 'none';

        // Actualizar la lista de tareas
        functionGETdata("http://localhost:3000/api/tasks");

    } catch (error) {
        console.error('Error al agregar la tarea:', error);
    }
}

// Inicializar datos
document.addEventListener('DOMContentLoaded', () => {
    const url = "http://localhost:3000/api/tasks";
    functionGETdata(url);
});

// Configurar el botón para abrir el modal
document.getElementById('new-task-button').addEventListener('click', () => {
    document.getElementById('task-modal').style.display = 'block';
});

// Configurar el botón para cerrar el modal
document.getElementById('close-modal-button').addEventListener('click', () => {
    document.getElementById('task-modal').style.display = 'none';
});

// Configurar el botón para guardar la tarea
document.getElementById('saveButton').addEventListener('click', addTask);
