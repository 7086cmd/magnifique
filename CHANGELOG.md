# [0.0.4](https://github.com/7086cmd/magnifique/releases/tag/v0.0.4)

## Chore

- Pin dependencies by @renovate in https://github.com/7086cmd/magnifique/pull/104
- Refactor & New by @7086cmd in https://github.com/7086cmd/magnifique/pull/133
- delete test code by @7086cmd in https://github.com/7086cmd/magnifique/pull/134

## Features

- Support E-Mail revice the post

## Fixes

- User Interface Shown Error in `member admin`

## Refactors

- Refact the `deduction` page (without `member` part) into one `SFC` file.

**Full Changelog**: https://github.com/7086cmd/magnifique/compare/v0.0.3...v0.0.4

# [0.0.3](https://github.com/7086cmd/magnifique/releases/tag/v0.0.3)

- Fix bug that vice minister can not admin member volunteer by @7086cmd

**Full Changelog**: https://github.com/7086cmd/magnifique/compare/v0.0.2...v0.0.3

# [0.0.2](https://github.com/7086cmd/magnifique/releases/tag/v0.0.2)

## Bug Fixes

- #114 by @7086cmd at #125
- #118 by @7086cmd at #122
- #121 by @7086cmd at #122
- #126 by @7086cmd at #127

## Weekly Plans

- #91
- #115

**Full Changelog**: https://github.com/7086cmd/magnifique/compare/v0.0.0...v0.0.2

# [0.0.1](https://github.com/7086cmd/magnifique/releases/tag/v0.0.1)

## Dependency Updates

- Update pnpm/action-setup action to v2.1.0 by @renovate in https://github.com/7086cmd/magnifique/pull/55
- Pin dependencies by @renovate in https://github.com/7086cmd/magnifique/pull/54
- Delete DEPENDABOT by @7086cmd in https://github.com/7086cmd/magnifique/pull/94
- Update dependency @vitejs/plugin-vue to v2.2.2 by @renovate in https://github.com/7086cmd/magnifique/pull/95
- Update dependency @vitejs/plugin-vue-jsx to v1.3.7 by @renovate in https://github.com/7086cmd/magnifique/pull/96
- Update typescript-eslint monorepo to v5.12.0 by @renovate in https://github.com/7086cmd/magnifique/pull/97

## Community Maintaination

- Edit CHANGELOG by @7086cmd in https://github.com/7086cmd/magnifique/pull/67
- Add CONTRIBUTING.md by @7086cmd in https://github.com/7086cmd/magnifique/pull/69
- 修改了一下 Workflow by @7086cmd in https://github.com/7086cmd/magnifique/pull/93
- Edit Issue Template by @7086cmd in https://github.com/7086cmd/magnifique/pull/82

## Bug Fixes

- Fix Bug #86 by @7086cmd in https://github.com/7086cmd/magnifique/pull/92
- Fix Bug #84 #85 before test by @7086cmd in https://github.com/7086cmd/magnifique/pull/103

## Features

- Add a util & refact issue template by @7086cmd in https://github.com/7086cmd/magnifique/pull/108
- Realize #87 by @7086cmd in https://github.com/7086cmd/magnifique/pull/110
- Release v0.0.1 by @7086cmd in https://github.com/7086cmd/magnifique/pull/111
- fix bug that vice-minister can not admin volunteer by @7086cmd in https://github.com/7086cmd/magnifique/pull/112

**Full Changelog**: https://github.com/7086cmd/magnifique/compare/v0.0.0...v0.0.1

# [v0.0.0](https://github.com/7086cmd/magnifique/releases/tag/v0.0.0)

## English Edition

### The first version is released! 👍 🥇

⏺️ If there is some bugs, please push `issues`.

### Production Introduce

1. Create `classes` for 3 grades and 15 classes each grade.

#### Password Style (**EXAMPLE**)

| Grade        | Class | Password |
| ------------ | ----- | -------- |
| 1 (2021 now) | 11    | 202111   |
| 2 (2020 now) | 11    | 202011   |
| 3 (2019 now) | 11    | 201911   |
| ...          | ...   | ...      |

2. Create `admin` account, and the default password is `secret`

### Steps for create a server

> Please view [README.md](https://github.com/7086cmd/magnifique#readme)

### Functions

1. 4 Big Funtions:

- Member (members register | delete)
- Deduction (Deductions create | delete | record | export) for the class sort.
- Volunteer (A criterion for judging the degree of participation in social practice activities) create | delete | export
- Post (Let's write articles to notificate or show our ideas, or news in school.)

2. Member Types:

- `register` You are not within the `student union`, but you have already submitted your application)
- `clerk` You are in the `student union`, but you are not allowed to administrate others.
- `vice-minister` You are the `Vice Minister` in your department. You can manage the `data` in the department.
- `minister` You are the most powerful person in the department. You can manage both the `data` and `member` **in your department**
- `vice-chairman` You are the `Vice Chairman` in the `Student Union`. You can manage data for departments and parts of departments.
- `chairman` You are the student with the most administrative authority in the entire student union. You can manage **all the data** but you also can not manage `members` each department.

3. Something different:

- The core team: not in the "chairman group". You are (`minister` | `vice-chairman` | `chairman`). You are elected by election.
- The minister of `volunteer managing department` can also manage the volunteer of the core team.

---

## 中文版本

### 第一个版本发布了! 👍 🥇

⏺️ 如果有一些 bug，请推送`issues`。

### 初始化功能

1. 为 3 个年级创建`班级`，每个年级 15 个班。

#### 密码样式 (**样例**)

| 年级            | 班级 | 密码   |
| --------------- | ---- | ------ |
| 1 (2021 年入学) | 11   | 202111 |
| 2 (2020 年入学) | 11   | 202011 |
| 3 (2019 年入学) | 11   | 201911 |
| ...             | ...  | ...    |

2. 创建**管理员**账户，密码是`secret`

### 创建服务器的步骤

> 请查看 [README.md](https://github.com/7086cmd/magnifique#readme)

### 功能

1. 4 大功能。

- 成员（`member`）（成员注册&删除）
- 扣分（`deduction`）（扣分创建&删除&记录&导出）用于班级排序
- 义工（`volunteer`）（判断参与社会实践活动程度的标准）创建&删除&导出
- 投稿（`post`）（让我们写文章来证明或展示我们的想法，或学校里的新闻。）

2. 会员类型。

- `注册成员`（`register`） 你不在`学生会`内，但你已经提交了你的申请)
- `干事`（`clerk`） "你在`学生会`内，但你不允许管理其他人。
- `副部长`（`vice-minister`） 你是你所在部门的`副部长`。你可以管理该部门的`数据`。
- `部长`（`minister`） 你是该部门最有权力的人。您可以管理您所在部门的`数据`和`成员`。
- `副主席`（`vice-chairman`） 你是`学生会'的`副主席`。您可以管理`部门`和部分部门的数据。
- `主席`（`chairman`） 你是整个学生会中拥有最大权力的学生。您可以管理\*\*所有的数据，但您也不能管理每个部门的`成员`。

3. 一些不同的东西。

- 核心团队（骨干成员）：不是"主席团"。你是（"部长"或"副主席"或"主席"）。你是在代表大会中通过选举产生的。
- 青志部部长（义工管理）也可以管理骨干成员的义工。

> 更多消息，请关注通知。

### What's Changed (**dependency updates**)

- Configure Renovate by @renovate in https://github.com/7086cmd/magnifique/pull/35
- Pin dependencies by @renovate in https://github.com/7086cmd/magnifique/pull/36
- Pin dependency @types/jest to 27.4.0 by @renovate in https://github.com/7086cmd/magnifique/pull/37
- Update dependency axios to v0.25.0 by @renovate in https://github.com/7086cmd/magnifique/pull/41
- Update dependency vitest to v0.2.7 by @renovate in https://github.com/7086cmd/magnifique/pull/43

### New Contributors

- @renovate made their first contribution in https://github.com/7086cmd/magnifique/pull/35

**Full Changelog**: https://github.com/7086cmd/magnifique/commits/v0.0.0
