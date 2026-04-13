# 🧠 Pumping Lemma Visualizer

An interactive web-based tool to **understand and visualize the Pumping Lemma for Regular Languages**. This project helps students and learners explore how strings are decomposed and “pumped” to determine whether a language is regular or not.

🔗 **Live Demo:** https://pumping-lemma-ten.vercel.app/

---

## 🚀 Features

* 🎯 **Interactive Language Input**
  Enter a language or choose from common examples to explore.

* 🔤 **String Analysis**
  Input a sample string and analyze whether it fits the given language.

* ✂️ **Automatic Decomposition (x, y, z)**
  Visual breakdown of the string into three parts following pumping lemma conditions.

* 🔁 **Pumping Simulation**
  Dynamically change the value of `i` and observe how the string evolves.

* 🎨 **Color-Coded Visualization**

  * 🔵 `x` (fixed part)
  * 🔴 `y` (pumped part)
  * 🟢 `z` (remaining part)

* 📊 **Real-Time Feedback**
  Instantly see whether the pumped string satisfies the language.

* ⚡ **Smooth UI & Animations**
  Clean interface with intuitive interactions for better understanding.

---

## 🧩 How It Works

1. Enter a language and a sample string.
2. The tool decomposes the string into `x`, `y`, and `z`.
3. Adjust the pumping value `i`.
4. Observe the new string formed:

   ```
   x + y^i + z
   ```
5. Analyze whether the resulting string still belongs to the language.

---

## 🎓 Educational Value

This tool is designed to:

* Help visualize abstract theoretical concepts
* Strengthen understanding of regular vs non-regular languages
* Provide hands-on experimentation with pumping lemma proofs

---

## 🛠️ Tech Stack

* **Frontend:** HTML, CSS, JavaScript
* **Deployment:** Vercel

---

