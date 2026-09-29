import { beforeEach, describe, expect, it } from "vitest";
import { RegisterUseCase } from "../../src/application/use-cases/auth/register";
import { LoginUseCase } from "../../src/application/use-cases/auth/login";
import { FakeHashProvider, FakeTokenProvider, InMemoryUsersRepository } from "../in-memory/repositories";

describe("Autenticação", () => {
  let users: InMemoryUsersRepository;
  let register: RegisterUseCase;
  let login: LoginUseCase;

  beforeEach(() => {
    users = new InMemoryUsersRepository();
    const hash = new FakeHashProvider();
    const tokens = new FakeTokenProvider();
    register = new RegisterUseCase(users, hash, tokens);
    login = new LoginUseCase(users, hash, tokens);
  });

  it("cria conta com senha criptografada e retorna token", async () => {
    const result = await register.execute({ name: "Ana Souza", email: "ANA@mail.com", password: "12345678" });
    expect(result.token).toBe(`token:${result.user.id}`);
    expect(result.user).not.toHaveProperty("passwordHash");
    expect(users.items[0]?.email).toBe("ana@mail.com");
    expect(users.items[0]?.passwordHash).not.toBe("12345678");
  });

  it("não permite e-mail duplicado", async () => {
    await register.execute({ name: "Ana", email: "ana@mail.com", password: "12345678" });
    await expect(
      register.execute({ name: "Ana 2", email: "ana@mail.com", password: "12345678" }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("exige senha com no mínimo 8 caracteres", async () => {
    await expect(
      register.execute({ name: "Ana", email: "ana@mail.com", password: "123" }),
    ).rejects.toMatchObject({ code: "BAD_USER_INPUT" });
  });

  it("faz login com credenciais válidas e rejeita senha errada", async () => {
    await register.execute({ name: "Ana", email: "ana@mail.com", password: "12345678" });
    await expect(login.execute({ email: "ana@mail.com", password: "12345678" })).resolves.toHaveProperty("token");
    await expect(login.execute({ email: "ana@mail.com", password: "errada00" })).rejects.toMatchObject({
      code: "UNAUTHENTICATED",
    });
  });
});
