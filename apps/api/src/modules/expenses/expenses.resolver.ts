import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';

import { CreateExpenseInput } from './dto/create-expense.input';
import { UpdateExpenseInput } from './dto/update-expense.input';
import { Expense } from './models/expense.model';
import { ExpensesService } from './expenses.service';

@Resolver(() => Expense)
export class ExpensesResolver {
  constructor(private readonly expensesService: ExpensesService) {}

  // ========== QUERIES ==========

  @Query(() => Expense, { description: 'Получить расход по ID' })
  @UseGuards(AuthGuard)
  async expense(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.expensesService.findById(id, user.id);
  }

  @Query(() => [Expense], { description: 'Получить все расходы проекта' })
  @UseGuards(AuthGuard)
  async expensesByProject(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.expensesService.findByProject(projectId, user.id);
  }

  @Query(() => [Expense], { description: 'Получить расходы по категории' })
  @UseGuards(AuthGuard)
  async expensesByCategory(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('category', { type: () => String }) category: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.expensesService.findByCategory(projectId, category, user.id);
  }

  // ========== MUTATIONS ==========

  @Mutation(() => Expense, { description: 'Создать расход' })
  @UseGuards(AuthGuard)
  async createExpense(
    @Args('input') input: CreateExpenseInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.expensesService.create(user.id, input);
  }

  @Mutation(() => Expense, { description: 'Обновить расход' })
  @UseGuards(AuthGuard)
  async updateExpense(
    @Args('input') input: UpdateExpenseInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.expensesService.update(user.id, input);
  }

  @Mutation(() => Expense, { description: 'Удалить расход' })
  @UseGuards(AuthGuard)
  async deleteExpense(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.expensesService.delete(id, user.id);
  }
}
