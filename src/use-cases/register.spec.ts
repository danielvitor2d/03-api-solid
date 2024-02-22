import { beforeEach, describe, expect, it } from 'vitest'
import { compare } from 'bcryptjs'

import { RegisterUseCase } from './register'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'

let usersRepository: InMemoryUsersRepository
let sut: RegisterUseCase

describe('Register Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new RegisterUseCase(usersRepository)
  })

  it('should be able to register', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@mail.com',
      password: 'johndoe123',
    })

    expect(user.id).toEqual(expect.any(String))
  })

  it('should hash user password upon registration', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@mail.com',
      password: 'johndoe123',
    })

    const isPasswordCorrectlyHashed = await compare(
      'johndoe123',
      user.password_hash,
    )

    expect(isPasswordCorrectlyHashed).toBe(true)
  })

  it('should not be able to register with same email twice', async () => {
    const email = 'johndoe@mail.com'

    await sut.execute({
      name: 'John Doe',
      email,
      password: 'johndoe123',
    })

    await expect(() =>
      sut.execute({
        name: 'John Doe',
        email,
        password: 'johndoe123',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })
})
