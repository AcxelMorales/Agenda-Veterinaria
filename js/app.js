'use strict';

let db;

const FORM = document.querySelector('form'),
    NAME_MASCOTA = document.getElementById('mascota'),
    NAME_CLIENTE = document.getElementById('cliente'),
    TEL = document.getElementById('telefono'),
    FECHA = document.getElementById('fecha'),
    HORA = document.getElementById('hora'),
    SINTOMAS = document.getElementById('sintomas'),
    CITAS = document.getElementById('citas'),
    ADMIN = document.getElementById('administra');

document.addEventListener('DOMContentLoaded', () => {
    let createDB = window.indexedDB.open('citas', 1);
    createDB.onerror = () => {
        console.log('hubo un error');
    }
    createDB.onsuccess = () => {
        db = createDB.result;
        mostrarCitas();
    }
    createDB.onupgradeneeded = e => {
        let db = e.target.result;
        let objectStore = db.createObjectStore('citas', {
            keyPath: 'key',
            autoIncrement: true
        });
        objectStore.createIndex('mascota', 'mascota', {
            unique: false
        });
        objectStore.createIndex('cliente', 'cliente', {
            unique: false
        });
        objectStore.createIndex('telefono', 'telefono', {
            unique: false
        });
        objectStore.createIndex('fecha', 'fecha', {
            unique: false
        });
        objectStore.createIndex('hora', 'hora', {
            unique: false
        });
        objectStore.createIndex('sintomas', 'sintomas', {
            unique: false
        });
    }

    FORM.addEventListener('submit', addData);

    function addData(e) {
        e.preventDefault();
        const NEW_CITA = {
            mascota: NAME_MASCOTA.value,
            cliente: NAME_CLIENTE.value,
            telefono: TEL.value,
            fecha: FECHA.value,
            hora: HORA.value,
            sintomas: SINTOMAS.value
        };

        let transaccion = db.transaction(['citas'], 'readwrite');
        let objectStore = transaccion.objectStore('citas');
        let request = objectStore.add(NEW_CITA);
        request.onsuccess = () => {
            FORM.reset();
        }
        transaccion.oncomplete = () => {
            mostrarCitas();
        }
        transaccion.onerror = () => {
            console.log('Hubo un error');
        }
    }

    const mostrarCitas = () => {
        while (CITAS.firstChild) {
            CITAS.remove(CITAS.firstChild);
        }

        let objectStore = db.transaction('citas').objectStore('citas');
        objectStore.openCursor().onsuccess = e => {
            let cursor = e.target.result;
            if (cursor) {
                let html = document.createElement('li');
                html.setAttribute('data-cita-id', cursor.value.key);
                html.classList.add('list-group-item');

                html.innerHTML = `
                    <p class="font-weight-bold">Mascota: <span class="font-weight-normal">${cursor.value.mascota}</span></p>
                    <p class="font-weight-bold">Cliente: <span class="font-weight-normal">${cursor.value.cliente}</span></p>
                    <p class="font-weight-bold">Teléfono: <span class="font-weight-normal">${cursor.value.telefono}</span></p>
                    <p class="font-weight-bold">Fecha: <span class="font-weight-normal">${cursor.value.fecha}</span></p>
                    <p class="font-weight-bold">Hora: <span class="font-weight-normal">${cursor.value.hora}</span></p>
                    <p class="font-weight-bold">Sintomas: <span class="font-weight-normal">${cursor.value.sintomas}</span></p>
                `;

                const BOTON = document.createElement('button');
                BOTON.classList.add('borrar', 'btn', 'btn-danger');
                BOTON.innerHTML = '<span aria-hidden="true">X</span> Borrar';
                BOTON.onclick = deleteData;
                html.appendChild(BOTON);

                CITAS.append(html);
                cursor.continue();
            } else {
                if (!CITAS.firstChild) {
                    ADMIN.textContent = 'Agrega un nueva cita';
                    let listado = document.createElement('p');
                    listado.classList.add('text-center');
                    listado.textContent = 'No hay citas';
                    CITAS.append(listado);
                } else {
                    ADMIN.textContent = 'Administra tus citas';
                }
            }
        }
    };

    function deleteData(e) {
        let citaID = Number(e.target.parentElement.getAttribute('data-cita-id'));
        let transaccion = db.transaction(['citas'], 'readwrite');
        let objectStore = transaccion.objectStore('citas');
        let request = objectStore.delete(citaID);

        transaccion.oncomplete = () => {
            e.target.parentElement.parentElement.removeChild(e.target.parentElement);
            if (!CITAS.firstChild) {
                ADMIN.textContent = 'Agrega un nueva cita';
                let listado = document.createElement('p');
                listado.classList.add('text-center');
                listado.textContent = 'No hay citas';
                CITAS.append(listado);
            } else {
                ADMIN.textContent = 'Administra tus citas';
            }
        }
    }
});