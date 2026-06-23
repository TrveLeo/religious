// Banco de perguntas de trivia bíblica. Fonte única, usada nos posts.
const TRIVIA_QUESTIONS = [
  {
    question: "Quantos dias Jesus jejuou no deserto antes de ser tentado?",
    options: ["30 dias", "40 dias", "50 dias", "7 dias"],
    correctIndex: 1,
    explanation: "Jesus jejuou 40 dias e 40 noites no deserto antes de enfrentar as tentações do diabo (Mateus 4:1-2)."
  },
  {
    question: "Qual foi o primeiro milagre registrado de Jesus?",
    options: ["Andar sobre as águas", "Multiplicar pães", "Transformar água em vinho", "Curar um cego"],
    correctIndex: 2,
    explanation: "No casamento em Caná, Jesus transformou água em vinho, seu primeiro milagre registrado (João 2:1-11)."
  },
  {
    question: "Quantos discípulos Jesus escolheu como apóstolos?",
    options: ["10", "12", "14", "7"],
    correctIndex: 1,
    explanation: "Jesus escolheu 12 apóstolos para acompanhá-lo de perto em seu ministério (Marcos 3:13-19)."
  },
  {
    question: "Quem traiu Jesus por 30 moedas de prata?",
    options: ["Pedro", "Tomé", "Judas Iscariotes", "João"],
    correctIndex: 2,
    explanation: "Judas Iscariotes entregou Jesus às autoridades por 30 moedas de prata (Mateus 26:14-16)."
  },
  {
    question: "Qual rei mandou construir o primeiro templo em Jerusalém?",
    options: ["Davi", "Salomão", "Saul", "Ezequias"],
    correctIndex: 1,
    explanation: "Salomão, filho de Davi, construiu o primeiro templo de Jerusalém (1 Reis 6)."
  },
  {
    question: "Quantos dias e noites durou o dilúvio (a chuva) nos tempos de Noé?",
    options: ["7 dias", "40 dias", "100 dias", "12 dias"],
    correctIndex: 1,
    explanation: "Choveu durante 40 dias e 40 noites sobre a terra (Gênesis 7:12)."
  },
  {
    question: "Quem foi engolido por um grande peixe e sobreviveu três dias dentro dele?",
    options: ["Jonas", "Daniel", "Elias", "Jó"],
    correctIndex: 0,
    explanation: "Jonas ficou três dias e três noites dentro do peixe antes de ser expelido (Jonas 1:17)."
  },
  {
    question: "Qual era o nome do irmão de Moisés que falava por ele diante do Faraó?",
    options: ["Arão", "Calebe", "Josué", "Aarão e Calebe"],
    correctIndex: 0,
    explanation: "Arão, irmão de Moisés, servia como seu porta-voz diante do Faraó (Êxodo 4:14-16)."
  },
  {
    question: "Quantos livros tem o Novo Testamento?",
    options: ["27", "39", "66", "12"],
    correctIndex: 0,
    explanation: "O Novo Testamento tem 27 livros, do Evangelho de Mateus ao Apocalipse."
  },
  {
    question: "Quem derrotou o gigante Golias?",
    options: ["Saul", "Davi", "Jônatas", "Samuel"],
    correctIndex: 1,
    explanation: "Davi, ainda jovem, derrotou o gigante filisteu Golias com uma funda e uma pedra (1 Samuel 17)."
  },
  {
    question: "Em qual cidade Jesus nasceu?",
    options: ["Jerusalém", "Nazaré", "Belém", "Cafarnaum"],
    correctIndex: 2,
    explanation: "Jesus nasceu em Belém, cumprindo a profecia do Antigo Testamento (Mateus 2:1)."
  },
  {
    question: "Qual apóstolo negou conhecer Jesus três vezes antes do canto do galo?",
    options: ["João", "Tiago", "Pedro", "André"],
    correctIndex: 2,
    explanation: "Pedro negou Jesus três vezes na noite da prisão, como Jesus havia previsto (Mateus 26:69-75)."
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TRIVIA_QUESTIONS;
}
