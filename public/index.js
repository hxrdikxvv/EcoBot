document.addEventListener("DOMContentLoaded", () => {
        const messagesDiv = document.getElementById("messages");
        const sendBtn = document.querySelector(".send-btn");
        const textInput = document.querySelector(".input-area input[type='text']");
        const hiddenInput = document.createElement("input");
        hiddenInput.type = "file";
        hiddenInput.accept = "image/*";
        hiddenInput.style.display = "none";
        document.body.appendChild(hiddenInput);

        sendBtn.addEventListener("click", async () => {
          const message = textInput.value.trim();
          if (!message) return;

          const userMessage = document.createElement("div");
          userMessage.classList.add("message", "user");
          userMessage.innerText = message;
          messagesDiv.appendChild(userMessage);
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
          textInput.value = "";

          try {
            const response = await fetch("http://localhost:3000/converse", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message }),
            });
            const result = await response.json();

            const botMessage = document.createElement("div");
            botMessage.classList.add("message", "bot");
            botMessage.innerText = result.content;
            messagesDiv.appendChild(botMessage);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
          } catch (err) {
            console.error(err);
            const errorMessage = document.createElement("div");
            errorMessage.classList.add("message", "bot");
            errorMessage.innerText = "Error sending message.";
            messagesDiv.appendChild(errorMessage);
          }
        });

        textInput.addEventListener("keypress", (e) => {
          if (e.key === "Enter") sendBtn.click();
        });

        document.querySelector(".upload-label").addEventListener("click", () => hiddenInput.click());

        hiddenInput.addEventListener("change", async () => {
          const file = hiddenInput.files[0];
          if (!file) return;

          const img = document.createElement("img");
          img.classList.add("right-img");
          img.src = URL.createObjectURL(file);
          img.style.maxWidth = "200px";
          img.style.borderRadius = "8px";
          messagesDiv.appendChild(img);

          const formData = new FormData();
          formData.append("image", file);

          try {
            const response = await fetch("http://localhost:3000/classify", {
              method: "POST",
              body: formData,
            });
            const result = await response.json();

            const botMessage = document.createElement("div");
            botMessage.classList.add("message", "bot");
            botMessage.innerText = "Category: " + result.category;
            messagesDiv.appendChild(botMessage);
            hiddenInput.value = "";
          } catch (err) {
            console.error(err);
            const errorP = document.createElement("p");
            errorP.innerText = "Error classifying image.";
            messagesDiv.appendChild(errorP);
          }
        });
      });