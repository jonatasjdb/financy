import bcrypt from "bcryptjs";
import { prisma } from "../src/infra/database/prisma/client";

/**
 * Popula o banco com um usuário de demonstração e ~12 meses de histórico financeiro.
 *   E-mail: conta@teste.com   Senha: 12345678
 *
 * Os dados são gerados com um gerador pseudoaleatório de semente fixa: rodar o seed
 * de novo produz sempre o mesmo resultado (relativo à data atual).
 * Só a conta de demonstração é recriada; outras contas não são alteradas.
 */
const DEMO_EMAIL = "conta@teste.com";
const MONTHS_OF_HISTORY = 12;

const categories = [
  { key: "salario", title: "Salário", description: "Renda mensal e bonificações", icon: "briefcase-business", color: "green" },
  { key: "investimento", title: "Investimento", description: "Aplicações e retornos financeiros", icon: "piggy-bank", color: "green" },
  { key: "alimentacao", title: "Alimentação", description: "Restaurantes, delivery e refeições", icon: "utensils", color: "blue" },
  { key: "mercado", title: "Mercado", description: "Compras de supermercado e mantimentos", icon: "shopping-cart", color: "orange" },
  { key: "transporte", title: "Transporte", description: "Gasolina, transporte público e viagens", icon: "car-front", color: "purple" },
  { key: "utilidades", title: "Utilidades", description: "Energia, água, internet e telefone", icon: "tool-case", color: "yellow" },
  { key: "moradia", title: "Moradia", description: "Aluguel, condomínio e manutenção", icon: "house", color: "blue" },
  { key: "entretenimento", title: "Entretenimento", description: "Cinema, jogos e lazer", icon: "ticket", color: "pink" },
  { key: "saude", title: "Saúde", description: "Medicamentos, consultas e exames", icon: "heart-pulse", color: "red" },
  { key: "educacao", title: "Educação", description: "Cursos, livros e pós-graduação", icon: "book-open", color: "purple" },
  { key: "pets", title: "Pets", description: "Ração, banho e veterinário", icon: "paw-print", color: "orange" },
  { key: "academia", title: "Academia", description: "Mensalidade e suplementos", icon: "dumbbell", color: "red" },
  { key: "presentes", title: "Presentes", description: "Aniversários e datas especiais", icon: "gift", color: "pink" },
  { key: "viagens", title: "Viagens", description: "Passagens, hospedagem e passeios", icon: "baggage-claim", color: "yellow" },
] as const;

type Key = (typeof categories)[number]["key"];
type Type = "INCOME" | "EXPENSE";

interface Draft {
  description: string;
  amount: number;
  type: Type;
  category: Key;
  date: Date;
}

// Gerador pseudoaleatório determinístico (mulberry32)
function createRandom(seed: number) {
  let a = seed;
  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    between: (min: number, max: number) => Math.round((min + next() * (max - min)) * 100) / 100,
    int: (min: number, max: number) => Math.floor(min + next() * (max - min + 1)),
    pick: <T>(list: readonly T[]) => list[Math.floor(next() * list.length)],
    chance: (probability: number) => next() < probability,
  };
}

function buildTransactions(): Draft[] {
  const rnd = createRandom(20260929);
  const today = new Date();
  const drafts: Draft[] = [];

  for (let monthsAgo = MONTHS_OF_HISTORY - 1; monthsAgo >= 0; monthsAgo--) {
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth() - monthsAgo;
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const maxDay = monthsAgo === 0 ? Math.min(today.getUTCDate(), lastDay) : lastDay;

    const add = (description: string, amount: number, type: Type, category: Key, day: number) => {
      if (day > maxDay) return; // não cria transações no futuro
      drafts.push({ description, amount, type, category, date: new Date(Date.UTC(year, month, day, 12)) });
    };
    const anyDay = () => rnd.int(1, maxDay);

    // Receitas
    add("Pagamento de Salário", 6850, "INCOME", "salario", 5);
    if (((month % 12) + 12) % 12 === 11) add("13º Salário", 6850, "INCOME", "salario", 20);
    if (rnd.chance(0.5)) add(rnd.pick(["Freelance - site institucional", "Freelance - API de integração", "Freelance - manutenção"]), rnd.between(800, 3200), "INCOME", "salario", anyDay());
    add("Rendimento CDB", rnd.between(120, 380), "INCOME", "investimento", 28);
    if (rnd.chance(0.3)) add("Dividendos FII", rnd.between(60, 240), "INCOME", "investimento", 15);

    // Despesas fixas
    add("Aluguel", 1850, "EXPENSE", "moradia", 10);
    add("Condomínio", 420, "EXPENSE", "moradia", 10);
    add("Conta de luz", rnd.between(160, 290), "EXPENSE", "utilidades", 12);
    add("Conta de água", rnd.between(70, 130), "EXPENSE", "utilidades", 14);
    add("Internet fibra", 119.9, "EXPENSE", "utilidades", 15);
    add("Plano de celular", 59.9, "EXPENSE", "utilidades", 18);
    add("Mensalidade da pós-graduação", 489, "EXPENSE", "educacao", 8);
    add("Mensalidade academia", 109.9, "EXPENSE", "academia", 6);
    add("Streaming", 55.9, "EXPENSE", "entretenimento", 7);
    add("Aporte mensal", 800, "EXPENSE", "investimento", 6);

    // Despesas variáveis
    for (let i = rnd.int(3, 5); i > 0; i--)
      add(rnd.pick(["Compras no Mercado", "Supermercado BH", "Hortifruti", "Atacadão", "Padaria"]), rnd.between(45, 420), "EXPENSE", "mercado", anyDay());
    for (let i = rnd.int(3, 7); i > 0; i--)
      add(rnd.pick(["Jantar no Restaurante", "Almoço executivo", "iFood", "Pizzaria", "Hamburgueria", "Café da manhã"]), rnd.between(22, 180), "EXPENSE", "alimentacao", anyDay());
    for (let i = rnd.int(2, 5); i > 0; i--)
      add(rnd.pick(["Posto de Gasolina", "Uber", "Estacionamento", "Pedágio", "Lavagem do carro"]), rnd.between(12, 260), "EXPENSE", "transporte", anyDay());
    for (let i = rnd.int(0, 3); i > 0; i--)
      add(rnd.pick(["Cinema", "Show", "Jogo na Steam", "Boliche", "Teatro"]), rnd.between(30, 250), "EXPENSE", "entretenimento", anyDay());
    if (rnd.chance(0.5)) add(rnd.pick(["Farmácia", "Consulta médica", "Exames laboratoriais", "Dentista"]), rnd.between(35, 480), "EXPENSE", "saude", anyDay());
    if (rnd.chance(0.7)) add(rnd.pick(["Ração", "Banho e tosa", "Veterinário", "Petiscos"]), rnd.between(40, 320), "EXPENSE", "pets", anyDay());
    if (rnd.chance(0.35)) add(rnd.pick(["Curso online", "Livro técnico", "Assinatura Alura"]), rnd.between(40, 350), "EXPENSE", "educacao", anyDay());
    if (rnd.chance(0.3)) add("Suplementos", rnd.between(90, 220), "EXPENSE", "academia", anyDay());
    if (rnd.chance(0.35)) add(rnd.pick(["Presente de aniversário", "Presente Dia das Mães", "Amigo secreto"]), rnd.between(60, 300), "EXPENSE", "presentes", anyDay());
    if (rnd.chance(0.2)) {
      add("Passagem aérea", rnd.between(450, 1400), "EXPENSE", "viagens", anyDay());
      add("Hospedagem", rnd.between(380, 1600), "EXPENSE", "viagens", anyDay());
    }
    if (rnd.chance(0.25)) add("Manutenção em casa", rnd.between(120, 650), "EXPENSE", "moradia", anyDay());
  }

  return drafts;
}

async function main() {
  await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } });

  const user = await prisma.user.create({
    data: { name: "Conta teste", email: DEMO_EMAIL, password: await bcrypt.hash("12345678", 10) },
  });

  const ids = {} as Record<Key, string>;
  for (const { key, ...data } of categories) {
    ids[key] = (await prisma.category.create({ data: { ...data, userId: user.id } })).id;
  }

  // Uma categoria sem transações, para testar a exclusão pela interface
  await prisma.category.create({
    data: { title: "Doações", description: "Categoria sem transações (pode ser excluída)", icon: "mailbox", color: "blue", userId: user.id },
  });

  const drafts = buildTransactions();
  await prisma.transaction.createMany({
    data: drafts.map((t) => ({
      description: t.description,
      amountInCents: Math.round(t.amount * 100),
      type: t.type,
      date: t.date,
      categoryId: ids[t.category],
      userId: user.id,
    })),
  });

  console.log(
    `🌱 Seed concluído: ${categories.length + 1} categorias e ${drafts.length} transações ` +
      `em ${MONTHS_OF_HISTORY} meses.\n   Login: ${DEMO_EMAIL} / 12345678`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
