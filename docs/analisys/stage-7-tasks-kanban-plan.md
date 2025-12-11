# План реализации: Этап 7 - Задачи и Kanban (Tasks & Kanban Board)

## Статус: 📋 ПЛАНИРУЕТСЯ

**Предыдущий этап:** Этап 6 (Финансы и зарплата) завершён ✅
**Текущая задача:** Добавить систему управления задачами с Kanban доской в проекты
**Цель:** Организация работ и отслеживание выполнения задач в рамках строительных проектов
**Приоритет:** 🟡 Важный (Post-MVP, улучшает организацию)
**Оценка времени:** 2 недели (80-90 часов)
**Блокирует:** Расширенное управление проектами

---

## Бизнес-ценность

### 💰 Impact

**Проблема которую решаем:** "Как не забыть что нужно сделать на объекте?"

**Текущая ситуация:**
- Задачи записываются в блокнот или в голове
- Нет четкого понимания что в работе
- Забывают купить материалы или выполнить работы
- Нет ответственных за задачи
- Сложно отследить прогресс работ

**После внедрения:**
- Kanban доска с 3 колонками (TODO → В работе → Выполнено)
- Drag & Drop для изменения статуса задач
- Назначение ответственных из участников команды
- Дедлайны для критических задач
- Чек-листы внутри задач
- История изменений

**Метрики успеха:**
- **Производительность +15%** - меньше забытых задач
- **Прозрачность +30%** - видно кто чем занят
- **Retention +10%** - полезная фича удерживает пользователей

---

## Текущее состояние

### ✅ Что уже есть:
- Database: Project model с проектами
- Database: TeamMember model с участниками
- Backend: ProjectsModule для управления проектами
- Frontend: Project Details Page с табами
- Frontend: Базовые UI компоненты (Card, Button, Badge)
- Design System: Готовые стили и анимации

### ❌ Что нужно добавить:
- Database: Task model для задач
- Backend: TasksModule с CRUD API
- Backend: Реордеринг задач (orderIndex)
- Frontend: KanbanBoard component с drag & drop
- Frontend: TaskCard component
- Frontend: TaskForm (create/edit modal)
- Integration: Вкладка "Задачи" в Project Details Page

---

## Критические решения

### 🔴 РЕШЕНИЕ #1: Kanban vs List View

**Варианты:**
1. **Только Kanban** - визуальная доска с колонками
2. **Только List** - простой список задач
3. **Гибрид** - переключение между режимами

**Выбор:** Только Kanban для MVP

**Обоснование:**
- ✅ Визуально понятно состояние задач
- ✅ Drag & Drop интуитивно
- ✅ Соответствует mental model прораба (доска на стене)
- ✅ Modern UX (все так делают)
- ❌ Минус: На mobile менее удобно (но приемлемо)

### 🔴 РЕШЕНИЕ #2: Статусы задач

**3 колонки Kanban:**
1. **TODO** (К выполнению)
2. **IN_PROGRESS** (В работе)
3. **DONE** (Выполнено)

**Почему не больше:**
- Простота для прорабов (не усложнять)
- MVP подход (можно расширить позже)
- 3 колонки влезают на экран без скролла

### 🔴 РЕШЕНИЕ #3: Drag & Drop библиотека

**Варианты:**
1. **@dnd-kit** - modern, accessible, performant
2. **react-beautiful-dnd** - популярная, но deprecated
3. **react-dnd** - старая, complex API

**Выбор:** @dnd-kit

**Обоснование:**
- ✅ Активно поддерживается (2024)
- ✅ TypeScript first
- ✅ Accessibility из коробки
- ✅ Touch support для mobile
- ✅ Хорошая документация
- ✅ Используется в крупных проектах

### 🔴 РЕШЕНИЕ #4: Task Assignment

**Уровень назначения:**
1. **Один ответственный** - только один участник
2. **Множественное назначение** - несколько участников
3. **Без назначения** - задача для всех

**Выбор:** Один ответственный ИЛИ без назначения

**Обоснование:**
- ✅ Простота (clear ownership)
- ✅ Accountability (один отвечает)
- ✅ MVP подход
- ❌ Multiple assignees можно добавить в Phase 2

---

## Архитектура решения

### 1. DATABASE SCHEMA

**Миграция:** `add_tasks_table`

#### Task Model

```prisma
model Task {
  id          String    @id @default(uuid())
  projectId   String    @map("project_id")
  title       String    @db.VarChar(200)
  description String?   @db.Text
  status      TaskStatus @default(TODO)

  // Assignment
  assigneeId  String?   @map("assignee_id")

  // Priority & Deadline
  priority    TaskPriority @default(MEDIUM)
  dueDate     DateTime? @map("due_date")

  // Ordering
  orderIndex  Int       @map("order_index") // Для drag & drop

  // Checklist (optional)
  checklist   Json?     // [{ text: "...", completed: boolean }]

  // Metadata
  createdById String    @map("created_by_id")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  completedAt DateTime? @map("completed_at")

  // Relations
  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignee    TeamMember?  @relation(fields: [assigneeId], references: [id], onDelete: SetNull)
  createdBy   User         @relation(fields: [createdById], references: [id])

  // Indexes
  @@index([projectId, status, orderIndex]) // Главный индекс для Kanban
  @@index([assigneeId])
  @@index([dueDate])
  @@map("tasks")
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

#### Project Model Update

```prisma
model Project {
  // ... existing fields
  tasks Task[] // Add relation
}
```

#### TeamMember Model Update

```prisma
model TeamMember {
  // ... existing fields
  assignedTasks Task[] // Add relation
}
```

---

### 2. BACKEND API

#### 2.1. Module Structure

```
apps/api/src/modules/
├── tasks/
│   ├── dto/
│   │   ├── create-task.input.ts
│   │   ├── update-task.input.ts
│   │   ├── move-task.input.ts
│   │   └── reorder-tasks.input.ts
│   ├── models/
│   │   ├── task.model.ts
│   │   ├── task-status.enum.ts
│   │   ├── task-priority.enum.ts
│   │   └── checklist-item.model.ts
│   ├── tasks.service.ts
│   ├── tasks.resolver.ts
│   └── tasks.module.ts
```

#### 2.2. DTOs

**CreateTaskInput:**
```typescript
@InputType()
export class CreateTaskInput {
  @Field()
  projectId: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => TaskStatus, { nullable: true, defaultValue: TaskStatus.TODO })
  status?: TaskStatus;

  @Field({ nullable: true })
  assigneeId?: string;

  @Field(() => TaskPriority, { nullable: true, defaultValue: TaskPriority.MEDIUM })
  priority?: TaskPriority;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  checklist?: ChecklistItem[];
}
```

**MoveTaskInput:**
```typescript
@InputType()
export class MoveTaskInput {
  @Field()
  taskId: string;

  @Field(() => TaskStatus)
  newStatus: TaskStatus;

  @Field()
  newOrderIndex: number;
}
```

**ReorderTasksInput:**
```typescript
@InputType()
export class ReorderTasksInput {
  @Field(() => [TaskOrderInput])
  tasks: TaskOrderInput[];
}

@InputType()
export class TaskOrderInput {
  @Field()
  taskId: string;

  @Field()
  orderIndex: number;
}
```

#### 2.3. GraphQL Models

**Task Model:**
```typescript
@ObjectType()
export class Task {
  @Field(() => ID)
  id: string;

  @Field()
  projectId: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => TaskStatus)
  status: TaskStatus;

  @Field({ nullable: true })
  assigneeId?: string;

  @Field(() => TaskPriority)
  priority: TaskPriority;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field()
  orderIndex: number;

  @Field(() => GraphQLJSON, { nullable: true })
  checklist?: ChecklistItem[];

  @Field()
  createdById: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  // Computed fields
  @Field(() => Project)
  project: Project;

  @Field(() => TeamMember, { nullable: true })
  assignee?: TeamMember;

  @Field(() => User)
  createdBy: User;

  @Field()
  isOverdue: boolean; // Computed
}

@ObjectType()
export class ChecklistItem {
  @Field()
  text: string;

  @Field()
  completed: boolean;
}
```

#### 2.4. TasksService

```typescript
@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Создать задачу
   */
  async create(input: CreateTaskInput, userId: string): Promise<Task> {
    // 1. Validate project access
    await this.validateProjectAccess(input.projectId, userId);

    // 2. Get max orderIndex for status column
    const maxOrder = await this.getMaxOrderIndex(input.projectId, input.status);

    // 3. Create task
    return this.prisma.task.create({
      data: {
        ...input,
        orderIndex: maxOrder + 1,
        createdById: userId,
      },
      include: this.includeRelations(),
    });
  }

  /**
   * Обновить задачу
   */
  async update(id: string, input: UpdateTaskInput, userId: string): Promise<Task> {
    const task = await this.findByIdWithAuth(id, userId);

    return this.prisma.task.update({
      where: { id },
      data: input,
      include: this.includeRelations(),
    });
  }

  /**
   * Переместить задачу (drag & drop)
   */
  async moveTask(input: MoveTaskInput, userId: string): Promise<Task> {
    const task = await this.findByIdWithAuth(input.taskId, userId);

    // Check if status changed
    const statusChanged = task.status !== input.newStatus;

    return this.prisma.$transaction(async (tx) => {
      if (statusChanged) {
        // Moving to different column
        // 1. Remove from old column (decrease orderIndex of tasks below)
        await tx.task.updateMany({
          where: {
            projectId: task.projectId,
            status: task.status,
            orderIndex: { gt: task.orderIndex },
          },
          data: {
            orderIndex: { decrement: 1 },
          },
        });

        // 2. Insert into new column (increase orderIndex of tasks at/below new position)
        await tx.task.updateMany({
          where: {
            projectId: task.projectId,
            status: input.newStatus,
            orderIndex: { gte: input.newOrderIndex },
          },
          data: {
            orderIndex: { increment: 1 },
          },
        });

        // 3. Update task
        return tx.task.update({
          where: { id: input.taskId },
          data: {
            status: input.newStatus,
            orderIndex: input.newOrderIndex,
            completedAt: input.newStatus === TaskStatus.DONE ? new Date() : null,
          },
          include: this.includeRelations(),
        });
      } else {
        // Reordering within same column
        const movingUp = input.newOrderIndex < task.orderIndex;

        if (movingUp) {
          // Shift tasks down
          await tx.task.updateMany({
            where: {
              projectId: task.projectId,
              status: task.status,
              orderIndex: {
                gte: input.newOrderIndex,
                lt: task.orderIndex,
              },
            },
            data: {
              orderIndex: { increment: 1 },
            },
          });
        } else {
          // Shift tasks up
          await tx.task.updateMany({
            where: {
              projectId: task.projectId,
              status: task.status,
              orderIndex: {
                gt: task.orderIndex,
                lte: input.newOrderIndex,
              },
            },
            data: {
              orderIndex: { decrement: 1 },
            },
          });
        }

        // Update task
        return tx.task.update({
          where: { id: input.taskId },
          data: {
            orderIndex: input.newOrderIndex,
          },
          include: this.includeRelations(),
        });
      }
    });
  }

  /**
   * Удалить задачу
   */
  async delete(id: string, userId: string): Promise<Task> {
    const task = await this.findByIdWithAuth(id, userId);

    // Decrease orderIndex of tasks below
    await this.prisma.task.updateMany({
      where: {
        projectId: task.projectId,
        status: task.status,
        orderIndex: { gt: task.orderIndex },
      },
      data: {
        orderIndex: { decrement: 1 },
      },
    });

    return this.prisma.task.delete({
      where: { id },
      include: this.includeRelations(),
    });
  }

  /**
   * Получить задачи проекта (сгруппированные по статусам)
   */
  async findByProject(projectId: string, userId: string) {
    await this.validateProjectAccess(projectId, userId);

    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      include: this.includeRelations(),
      orderBy: [{ status: 'asc' }, { orderIndex: 'asc' }],
    });

    // Group by status
    return {
      TODO: tasks.filter((t) => t.status === TaskStatus.TODO),
      IN_PROGRESS: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS),
      DONE: tasks.filter((t) => t.status === TaskStatus.DONE),
    };
  }

  /**
   * Получить задачи участника
   */
  async findByAssignee(assigneeId: string, userId: string) {
    // Validate: user is assignee or team member
    const member = await this.prisma.teamMember.findUnique({
      where: { id: assigneeId },
      include: { team: true },
    });

    if (!member || member.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.task.findMany({
      where: {
        assigneeId,
        status: { not: TaskStatus.DONE },
      },
      include: this.includeRelations(),
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
    });
  }

  // Helper methods...

  private async validateProjectAccess(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { team: { include: { members: true } } },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isMember = project.team.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('Access denied');
    }
  }

  private async getMaxOrderIndex(projectId: string, status: TaskStatus) {
    const result = await this.prisma.task.aggregate({
      where: { projectId, status },
      _max: { orderIndex: true },
    });

    return result._max.orderIndex ?? -1;
  }

  private includeRelations() {
    return {
      project: true,
      assignee: { include: { user: true } },
      createdBy: true,
    };
  }
}
```

#### 2.5. TasksResolver

```typescript
@Resolver(() => Task)
@UseGuards(AuthGuard)
export class TasksResolver {
  constructor(private tasksService: TasksService) {}

  // ============ QUERIES ============

  @Query(() => Task)
  async task(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.findById(id, user.id);
  }

  @Query(() => TasksByStatus)
  async projectTasks(
    @Args('projectId') projectId: string,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.findByProject(projectId, user.id);
  }

  @Query(() => [Task])
  async myTasks(@CurrentUser() user: User): Promise<Task[]> {
    // Get all teams user is member of, then get tasks assigned to user
    return this.tasksService.findByUser(user.id);
  }

  @Query(() => [Task])
  async memberTasks(
    @Args('assigneeId') assigneeId: string,
    @CurrentUser() user: User,
  ): Promise<Task[]> {
    return this.tasksService.findByAssignee(assigneeId, user.id);
  }

  // ============ MUTATIONS ============

  @Mutation(() => Task)
  async createTask(
    @Args('input') input: CreateTaskInput,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.create(input, user.id);
  }

  @Mutation(() => Task)
  async updateTask(
    @Args('id') id: string,
    @Args('input') input: UpdateTaskInput,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.update(id, input, user.id);
  }

  @Mutation(() => Task)
  async moveTask(
    @Args('input') input: MoveTaskInput,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.moveTask(input, user.id);
  }

  @Mutation(() => Boolean)
  async reorderTasks(
    @Args('input') input: ReorderTasksInput,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    await this.tasksService.reorder(input, user.id);
    return true;
  }

  @Mutation(() => Task)
  async deleteTask(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<Task> {
    return this.tasksService.delete(id, user.id);
  }
}
```

---

### 3. FRONTEND IMPLEMENTATION

#### 3.1. Validation Schemas (Zod)

```typescript
// apps/web/src/packages/schemas/tasks/index.ts

import { z } from 'zod';

export const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);
export const taskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const checklistItemSchema = z.object({
  text: z.string().min(1, 'Текст не может быть пустым'),
  completed: z.boolean().default(false),
});

export const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1, 'Введите название').max(200),
  description: z.string().optional(),
  status: taskStatusSchema.default('TODO'),
  assigneeId: z.string().uuid().optional(),
  priority: taskPrioritySchema.default('MEDIUM'),
  dueDate: z.date().optional(),
  checklist: z.array(checklistItemSchema).optional(),
});

export const updateTaskSchema = createTaskSchema.partial().omit({ projectId: true });

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
```

#### 3.2. GraphQL Operations

```graphql
# apps/web/src/packages/api/graphql/tasks.graphql

# ============ FRAGMENTS ============

fragment TaskFields on Task {
  id
  projectId
  title
  description
  status
  assigneeId
  priority
  dueDate
  orderIndex
  checklist
  createdById
  createdAt
  updatedAt
  completedAt
  isOverdue
  assignee {
    id
    user {
      id
      fullName
      email
    }
  }
  createdBy {
    id
    fullName
  }
}

# ============ QUERIES ============

query Task($id: ID!) {
  task(id: $id) {
    ...TaskFields
  }
}

query ProjectTasks($projectId: ID!) {
  projectTasks(projectId: $projectId) {
    TODO {
      ...TaskFields
    }
    IN_PROGRESS {
      ...TaskFields
    }
    DONE {
      ...TaskFields
    }
  }
}

query MyTasks {
  myTasks {
    ...TaskFields
    project {
      id
      name
    }
  }
}

# ============ MUTATIONS ============

mutation CreateTask($input: CreateTaskInput!) {
  createTask(input: $input) {
    ...TaskFields
  }
}

mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
  updateTask(id: $id, input: $input) {
    ...TaskFields
  }
}

mutation MoveTask($input: MoveTaskInput!) {
  moveTask(input: $input) {
    ...TaskFields
  }
}

mutation DeleteTask($id: ID!) {
  deleteTask(id: $id) {
    ...TaskFields
  }
}
```

#### 3.3. UI Components

**1. KanbanBoard Component**

```typescript
// apps/web/src/packages/components/tasks/KanbanBoard.tsx

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

interface KanbanBoardProps {
  tasks: {
    TODO: Task[];
    IN_PROGRESS: Task[];
    DONE: Task[];
  };
  onMoveTask: (taskId: string, newStatus: TaskStatus, newIndex: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function KanbanBoard({ tasks, onMoveTask, onEditTask, onDeleteTask }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Parse destination
    const [newStatus, indexStr] = overId.split(':');
    const newIndex = parseInt(indexStr, 10);

    onMoveTask(taskId, newStatus as TaskStatus, newIndex);
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KanbanColumn
          title="К выполнению"
          status="TODO"
          tasks={tasks.TODO}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
        <KanbanColumn
          title="В работе"
          status="IN_PROGRESS"
          tasks={tasks.IN_PROGRESS}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
        <KanbanColumn
          title="Выполнено"
          status="DONE"
          tasks={tasks.DONE}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      </div>

      <DragOverlay>
        {activeId ? (
          <TaskCard task={findTask(activeId, tasks)} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
```

**2. KanbanColumn Component**

```typescript
// apps/web/src/packages/components/tasks/KanbanColumn.tsx

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function KanbanColumn({ title, status, tasks, onEditTask, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: `${status}:${tasks.length}`,
  });

  const taskIds = tasks.map((t) => t.id);

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-t-lg">
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>

      {/* Tasks Container */}
      <Card className="flex-1 p-4 space-y-3 rounded-t-none border-t-0">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef} className="space-y-3 min-h-[200px]">
            {tasks.map((task, index) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={() => onEditTask(task)}
                onDelete={() => onDeleteTask(task.id)}
              />
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Перетащите задачу сюда
              </div>
            )}
          </div>
        </SortableContext>
      </Card>
    </div>
  );
}
```

**3. TaskCard Component**

```typescript
// apps/web/src/packages/components/tasks/TaskCard.tsx

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, isDragging }: TaskCardProps) {
  return (
    <Card
      className={cn(
        'p-4 cursor-grab active:cursor-grabbing space-y-2',
        isDragging && 'opacity-50 rotate-3'
      )}
    >
      {/* Priority Badge */}
      {task.priority !== 'MEDIUM' && (
        <Badge
          variant={
            task.priority === 'URGENT'
              ? 'destructive'
              : task.priority === 'HIGH'
              ? 'warning'
              : 'secondary'
          }
          className="text-xs"
        >
          {task.priority}
        </Badge>
      )}

      {/* Title */}
      <h4 className="font-medium line-clamp-2">{task.title}</h4>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Checklist Progress */}
      {task.checklist && task.checklist.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckSquare className="h-3 w-3" />
          <span>
            {task.checklist.filter((i) => i.completed).length} / {task.checklist.length}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        {/* Assignee */}
        {task.assignee && (
          <div className="flex items-center gap-2">
            <Avatar src={task.assignee.user.avatarUrl} size="xs" />
            <span className="text-xs text-muted-foreground">
              {task.assignee.user.fullName}
            </span>
          </div>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div
            className={cn(
              'text-xs flex items-center gap-1',
              task.isOverdue ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            <Calendar className="h-3 w-3" />
            {format(task.dueDate, 'dd MMM')}
          </div>
        )}

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Редактировать
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}

function SortableTaskCard(props: TaskCardProps & { index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard {...props} isDragging={isDragging} />
    </div>
  );
}
```

**4. TaskForm Component**

```typescript
// apps/web/src/packages/components/tasks/TaskForm.tsx

interface TaskFormProps {
  projectId: string;
  task?: Task; // Edit mode
  teamMembers: TeamMember[];
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => void;
  onCancel: () => void;
}

export function TaskForm({ projectId, task, teamMembers, onSubmit, onCancel }: TaskFormProps) {
  const form = useForm({
    resolver: zodResolver(task ? updateTaskSchema : createTaskSchema),
    defaultValues: task || {
      projectId,
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название задачи *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Купить цемент" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Детали задачи..." rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Assignee */}
        <FormField
          control={form.control}
          name="assigneeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ответственный</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Не назначен" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Не назначен</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.user.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Priority */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Приоритет</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="LOW">Низкий</SelectItem>
                  <SelectItem value="MEDIUM">Средний</SelectItem>
                  <SelectItem value="HIGH">Высокий</SelectItem>
                  <SelectItem value="URGENT">Срочно</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Due Date */}
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field}) => (
            <FormItem>
              <FormLabel>Срок выполнения</FormLabel>
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                placeholder="Выберите дату"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            {task ? 'Сохранить' : 'Создать задачу'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

#### 3.4. Page Integration

```typescript
// apps/web/src/app/(root)/(protected)/teams/[teamId]/projects/[projectId]/page.tsx

// Add "Задачи" tab
const TABS = [
  { value: 'info', label: 'Информация' },
  { value: 'expenses', label: 'Расходы' },
  { value: 'tasks', label: 'Задачи' }, // NEW
  { value: 'photos', label: 'Фотоотчёты' },
  { value: 'payouts', label: 'Выплаты' },
];

// Tasks Tab Content
{activeTab === 'tasks' && (
  <div className="space-y-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">Задачи</h2>
      <Button onClick={() => setShowTaskForm(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Добавить задачу
      </Button>
    </div>

    {/* Kanban Board */}
    <KanbanBoard
      tasks={tasks}
      onMoveTask={handleMoveTask}
      onEditTask={handleEditTask}
      onDeleteTask={handleDeleteTask}
    />

    {/* Task Form Modal */}
    <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingTask ? 'Редактировать задачу' : 'Новая задача'}
          </DialogTitle>
        </DialogHeader>
        <TaskForm
          projectId={project.id}
          task={editingTask}
          teamMembers={project.team.members}
          onSubmit={handleSubmitTask}
          onCancel={() => setShowTaskForm(false)}
        />
      </DialogContent>
    </Dialog>
  </div>
)}
```

---

## Пошаговая реализация

### Phase 1: Backend Foundation (Days 1-2)

**День 1: Database & Models**
- [ ] Создать Task model в Prisma
- [ ] Добавить TaskStatus, TaskPriority enums
- [ ] Обновить Project и TeamMember relations
- [ ] Создать миграцию `add_tasks_table`
- [ ] Выполнить `prisma db push` и `prisma generate`

**День 2: TasksModule**
- [ ] Создать структуру `apps/api/src/modules/tasks/`
- [ ] Реализовать DTOs (4 input types)
- [ ] Реализовать GraphQL Models (Task, ChecklistItem)
- [ ] Реализовать TasksService (8 методов + helpers)
- [ ] Реализовать TasksResolver (4 queries + 5 mutations)
- [ ] Добавить в app.module.ts
- [ ] Тестирование API

### Phase 2: Frontend Foundation (Days 3-4)

**День 3: GraphQL & Schemas**
- [ ] Создать tasks.graphql (4 queries + 4 mutations)
- [ ] Запустить codegen
- [ ] Создать Zod schemas (createTask, updateTask)
- [ ] Экспортировать в packages/schemas/

**День 4: Dependencies**
- [ ] Установить @dnd-kit/* (4 пакета)
- [ ] Настроить TypeScript types для @dnd-kit
- [ ] Тестирование базового drag & drop

### Phase 3: UI Components (Days 5-7)

**День 5: TaskCard**
- [ ] Реализовать TaskCard component
- [ ] Реализовать SortableTaskCard wrapper
- [ ] Priority badges
- [ ] Assignee avatar
- [ ] Due date с overdue indicator
- [ ] Actions menu (edit, delete)

**День 6: KanbanColumn**
- [ ] Реализовать KanbanColumn component
- [ ] Droppable area
- [ ] SortableContext integration
- [ ] Empty state
- [ ] Column header с count

**День 7: KanbanBoard**
- [ ] Реализовать KanbanBoard component
- [ ] DndContext setup
- [ ] DragOverlay
- [ ] Sensors configuration (pointer, keyboard)
- [ ] Collision detection
- [ ] handleDragEnd logic

### Phase 4: Task Form & Integration (Days 8-9)

**День 8: TaskForm**
- [ ] Реализовать TaskForm component
- [ ] React Hook Form integration
- [ ] Zod validation
- [ ] All fields (title, description, assignee, priority, dueDate)
- [ ] Create/Edit modes

**День 9: Page Integration**
- [ ] Добавить вкладку "Задачи" в Project Details
- [ ] Интегрировать KanbanBoard
- [ ] Интегрировать TaskForm в Dialog
- [ ] Apollo mutations (create, update, move, delete)
- [ ] Optimistic updates для drag & drop
- [ ] Error handling

### Phase 5: Testing & Documentation (Day 10)

**День 10: Testing & Docs**
- [ ] Manual testing всех сценариев
- [ ] Drag & drop на desktop
- [ ] Drag & drop на mobile (touch)
- [ ] Keyboard navigation testing
- [ ] TypeScript: 0 ошибок
- [ ] Update CHANGELOG.md
- [ ] Update roadmap.md

---

## Критические файлы

### Backend (12 new + 3 modifications)

**New Files (12):**
- apps/api/prisma/schema.prisma (Task model)
- apps/api/src/modules/tasks/ (12 файлов)
  - dto/create-task.input.ts
  - dto/update-task.input.ts
  - dto/move-task.input.ts
  - dto/reorder-tasks.input.ts
  - models/task.model.ts
  - models/task-status.enum.ts
  - models/task-priority.enum.ts
  - models/checklist-item.model.ts
  - tasks.service.ts
  - tasks.resolver.ts
  - tasks.module.ts

**Modifications (3):**
- apps/api/src/app.module.ts (import TasksModule)
- apps/api/prisma/schema.prisma (Project, TeamMember relations)

### Frontend (10 new + 5 modifications)

**New Files (10):**
- apps/web/src/packages/api/graphql/tasks.graphql
- apps/web/src/packages/schemas/tasks/index.ts
- apps/web/src/packages/components/tasks/ (7 файлов)
  - KanbanBoard.tsx
  - KanbanColumn.tsx
  - TaskCard.tsx
  - SortableTaskCard.tsx
  - TaskForm.tsx
  - TaskFormDialog.tsx
  - index.ts

**Modifications (5):**
- apps/web/src/app/(root)/(protected)/teams/[teamId]/projects/[projectId]/page.tsx (add tasks tab)
- apps/web/src/packages/components/index.ts (exports)
- apps/web/src/packages/schemas/index.ts (exports)
- apps/web/package.json (add @dnd-kit dependencies)
- apps/web/src/packages/api/graphql/__generated__/output.ts (codegen)

---

## Success Criteria

### Must Have (MVP)
- [ ] Task model создана в БД
- [ ] CRUD операции для задач
- [ ] 3-колоночный Kanban (TODO, IN_PROGRESS, DONE)
- [ ] Drag & Drop работает (desktop + mobile)
- [ ] Назначение ответственных
- [ ] Priority badges
- [ ] Due dates с overdue indicator
- [ ] TaskForm (create/edit)
- [ ] Интеграция в Project Details Page
- [ ] TypeScript: 0 ошибок
- [ ] GraphQL API протестирован

### Nice to Have (Phase 2)
- [ ] Checklist внутри задач
- [ ] Task comments
- [ ] Task attachments (files)
- [ ] Filter/Sort задач
- [ ] Multiple assignees
- [ ] Subtasks
- [ ] Task templates
- [ ] Sprint/Milestone grouping

---

## Risks & Mitigation

### 🟡 Средний риск: Drag & Drop на Mobile

**Проблема:** Touch events могут конфликтовать
**Митигация:**
- @dnd-kit поддерживает touch из коробки
- Тестирование на реальных устройствах
- Fallback на buttons для move (если drag не работает)

### 🟡 Средний риск: OrderIndex Race Conditions

**Проблема:** Concurrent reordering может сломать порядок
**Митигация:**
- Prisma transactions для atomic updates
- Optimistic UI updates
- Refetch после каждого move (fallback)

### 🟢 Низкий риск: Performance на больших досках

**Проблема:** >100 задач может лагать
**Митигация:**
- React.memo для TaskCard
- Virtual scrolling (если понадобится)
- Archive old DONE tasks (future)

---

## Технический долг

**Отложено на Phase 2:**
- [ ] Checklist functionality
- [ ] Task comments
- [ ] File attachments
- [ ] Advanced filters
- [ ] Bulk operations
- [ ] Task templates
- [ ] Recurring tasks
- [ ] Time tracking
- [ ] Gantt chart view

---

## Dependencies

**Backend:**
- ✅ Existing dependencies sufficient

**Frontend:**
- 🆕 @dnd-kit/core
- 🆕 @dnd-kit/sortable
- 🆕 @dnd-kit/utilities
- 🆕 @dnd-kit/modifiers

---

## Документация

**Будет создано:**
- [ ] docs/analisys/stage-7-tasks-kanban-plan.md (этот файл)

**Будет обновлено:**
- [ ] docs/roadmap.md (mark Stage 7 complete)
- [ ] CHANGELOG.md (Stage 7 section)

---

**Plan Created:** 2025-12-11
**Planned Start:** После завершения Stage 6
**Estimated Duration:** 10 дней (80-90 часов)
**Priority:** 🟡 Важный (Post-MVP)
**Status:** 📋 Planning

---

_Детальный план готов к выполнению. Ожидает подтверждения для начала реализации._
