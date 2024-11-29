document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registrationForm");
  const recordsTable = document
    .getElementById("recordsTable")
    .querySelector("tbody");

  // Arrays de datos
  const careers = [
    "Administración de empresas",
    "Bacteriología",
    "Contaduría pública",
    "Derecho",
    "Enfermería",
    "Ingeniería de sistemas",
    "Instrumentación quirúrgica",
    "Licenciatura en educación infantil",
    "Medicina",
    "Odontología",
    "Tecnología en atención prehospitalaria",
    "Tecnología en estética y cosmetología",
    "Tecnología en mecánica personal",
    "Trabajo social",
  ];
  const typeDocuments = [
    "Cédula de ciudadanía",
    "Tarjeta de identidad",
    "Tarjeta de extranjería",
  ];

  let records = [];
  let editIndex = null;

  // Función para poblar select dinámicamente
  function populateSelect(selectElement, optionsArray) {
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Seleccione...";
    selectElement.appendChild(defaultOption);

    optionsArray.forEach((optionValue) => {
      const option = document.createElement("option");
      option.value = optionValue;
      option.textContent = optionValue;
      selectElement.appendChild(option);
    });
  }

  // Poblar los selects
  populateSelect(document.getElementById("career"), careers);
  populateSelect(document.getElementById("typeDocument"), typeDocuments);

  // Lógica para input adicional en discapacidad
  const extraInput = document.getElementById("extraInput");
  const extraLabel = document.getElementById("extraLabel");
  extraInput.style.display = "none";
  extraLabel.style.display = "none";

  document
    .querySelectorAll('input[name="discapacidad"]')
    .forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        if (checkbox.value === "Otra" && checkbox.checked) {
          extraLabel.style.display = "block";
          extraInput.style.display = "block";
          extraInput.disabled = false;
        } else if (checkbox.value === "Otra" && !checkbox.checked) {
          extraLabel.style.display = "none";
          extraInput.style.display = "none";
          extraInput.value = ""; // Limpiar el campo
          extraInput.disabled = true;
        }
      });
    });

  // Guardar y editar registros
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Guardar valores seleccionados de checkboxes
    const checkboxes = ["children", "cultura", "discapacidad", "trabajo"];
    checkboxes.forEach((key) => {
      data[key] = Array.from(
        document.querySelectorAll(`input[name="${key}"]:checked`)
      ).map((checkbox) => checkbox.value);
    });

    // Guardar valor de input adicional
    if (data.discapacidad.includes("Otra")) {
      data.extraInput = document.getElementById("extraInput").value;
    }

    if (editIndex === null) {
      records.push(data);
    } else {
      records[editIndex] = data;
      editIndex = null;
    }

    form.reset();
    renderTable();
  });

  // Renderizar la tabla
  function renderTable() {
    recordsTable.innerHTML = "";

    if (records.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="7" style="text-align: center; color: gray;">Sin registros</td>`;
      recordsTable.appendChild(row);
      return;
    }

    records.forEach((record, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${record.career}</td>
        <td>${record.fullName} ${record.secondName} ${record.firstLastName} ${record.secondLastName}</td>
        <td>${record.bornDate}</td>
        <td>${record.email}</td>
        <td>${record.tel}</td>
        <td>${record.cel}</td>
        <td>
          <span class="action-btn edit-btn" data-index="${index}">✏️</span>
          <span class="action-btn delete-btn" data-index="${index}">🗑️</span>
        </td>
      `;
      recordsTable.appendChild(row);
    });

    // Editar un registro
    function editRecord(index) {
      const record = records[index];
      console.log(record);
      // Loop through all fields and set values
      Object.keys(record).forEach((key) => {
        const fields = form.elements[key];

        if (fields) {
          if (fields instanceof NodeList) {
            // Si fields es un NodeList (varios checkboxes), iteramos sobre ellos
            fields.forEach((field) => {
              if (field.type === "checkbox") {
                // Si es un checkbox, verificamos si su valor está en el registro
                field.checked = record[key].includes(field.value);
              } else if (field.type === "radio") {
                // Si es un radio, seleccionamos el valor correspondiente
                field.checked = field.value === record[key];
              }
            });
          } else {
            // Si no es un NodeList, es un solo elemento (como un input de texto o select)
            if (fields.type !== "file") {
              fields.value = record[key];
            }
          }
        } else {
          console.log(`No se encontró el campo con name=${key}`);
        }
      });

      // Handle additional input for "Otra discapacidad"
      if (record.discapacidad && record.discapacidad.includes("Otra")) {
        extraInput.value = record.extraInput || "";
        extraInput.style.display = "block";
        extraLabel.style.display = "block";
      } else {
        extraInput.value = "";
        extraInput.style.display = "none";
        extraLabel.style.display = "none";
      }

      // Set the editIndex to the current record
      editIndex = index;
    }

    // Eventos para editar y eliminar
    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        const index = event.target.getAttribute("data-index");
        editRecord(index);
      });
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        const index = event.target.getAttribute("data-index");
        deleteRecord(index);
      });
    });
  }

  // Eliminar un registro
  function deleteRecord(index) {
    if (confirm("¿Seguro que deseas eliminar este registro?")) {
      records.splice(index, 1);
      renderTable();
      // Resetear el formulario después de eliminar
      const form = document.querySelector("#registrationForm");
      form.reset();
    }
  }

  // Inicializar tabla
  renderTable();
});
document
  .getElementById("registrationForm")
  .addEventListener("submit", function (event) {
    const requiredFields = document.querySelectorAll(
      "input[required], select[required]"
    );

    let isValid = true; // Variable para verificar si el formulario es válido

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        console.log("ró");
        // Resaltar el campo en rojo si está vacío o inválido
        field.style.border = "1px solid red";
        field.style.backgroundColor = "#ffe6e6";
        isValid = false; // Marcar el formulario como no válido
      } else {
        // Restaurar el estilo original si el campo es válido
        field.style.border = "";
        field.style.backgroundColor = "";
      }
    });

    // Prevenir el envío del formulario si hay campos inválidos
    if (!isValid) {
      event.preventDefault(); // Evitar el envío del formulario
      alert("Por favor, completa todos los campos requeridos.");
    }
  });
