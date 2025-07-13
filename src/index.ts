
// 1.
function hasUniqueChars(str: string): boolean {
    return new Set(str).size == str.length;
}

// тестируем
console.log(`hasUniqueChars("abcde"): ${ hasUniqueChars("abcde") }`); // True
console.log(`hasUniqueChars("hello"): ${ hasUniqueChars("hello") }`); // False



// 2.
function areAnagrams(a: string, b: string): boolean {
    return a.length === b.length && 
           [...a].sort().join('') === [...b].sort().join('');
}

// тестируем
console.log(`areAnagrams("listen", "silent"): ${ areAnagrams("listen", "silent") }`); // True
console.log(`areAnagrams("hello", 'hella'): ${ areAnagrams("hello", 'hella') }`); // False



// 3.

// эмуляция ошибок
async function doError(errorMessage: string): Promise<Error> {
    return Promise.reject(new Error(`${ errorMessage }`));
}


async function getUserInfo(userId: string): Promise<{ id: string, name: string, email: string }> {
    console.log(`Получение информации о пользователе ${ userId }...`);
    //await doError('Ошибка при получении информации о пользователе!');
    return new Promise(resolve => setTimeout(() => resolve({id: userId, name:'Alice', email: 'alice@example.com'}), 100))
}


async function getUserSettings(userId: string): Promise<{ theme: string, language: string }> {
    console.log(`Получение настроек пользователя ${ userId }...`);
    //await doError('Ошибка при получении настроек пользователя!')
    return new Promise(resolve => setTimeout(() => resolve({theme: 'dark', language: 'en'}) , 150));
}


async function getUserPermissions(userId: string): Promise<string[]> {
    console.log(`Получение прав пользователя ${ userId }...`);
    //await doError('Ошибка при получении прав пользователя!')
    return new Promise(resolve => setTimeout(() => resolve(["read", "write"]), 200));
}



// Определение UserSnapshot
interface UserSnapshot {
  id: string;
  name: string;
  email: string;
  settings: {
    theme: string;
    language: string;
  };
  permissions: string[];
}


async function buildUserSnapshot(userId: string): Promise<UserSnapshot> {
    try {
        // заведем дефольные значения для случаев, если какая либо из функций завершится с ошибкой
        const defaultUserInfo = { id: userId, name: 'Unknown', email: 'unknown@example.com' };
        const defaultUserSettings = { theme: 'light', language: 'en' };
        const defaultUserPermissions: string[] = [];

        let userInfo = defaultUserInfo;
        let userSettings = defaultUserSettings;
        let userPermissions = defaultUserPermissions;

        const promises = [
            getUserInfo(userId)
                .then(data => { userInfo = data; return true; })
                .catch(error => { console.log(`Не удалось получить информацию о пользователе ${userId}: ${error.message}`); return false; }),
            getUserSettings(userId)
                .then(data => { userSettings = data; return true; })
                .catch(error => { console.log(`Не удалось получить настройки пользователя ${userId}: ${error.message}`); return false; }),
            getUserPermissions(userId)
                .then(data => { userPermissions = data; return true; })
                .catch(error => { console.log(`Не удалось получить права пользователя ${userId}: ${error.message}`); return false; })
        ];

        await Promise.allSettled(promises);

        return {
           id: userId,
           name: userInfo.name,
           email: userInfo.email,
           settings:userSettings,
           permissions: userPermissions,
        };
    } catch (error: any) {
        throw new Error(`Не удалось получить слепок пользователя ${userId}: ${error.message || 'неизвестная ошибка'}`);
    }
}


// тестируем
(async () => {
        try {
            const snapshot = await buildUserSnapshot("u-123")
            console.log(snapshot)
        } catch (error: any) {
            console.error("Произошла ошибка:", error.message);
        }
    }
)();



// 4.
interface TaskMessage {
    id: string
    title: string
    createdAt: string // ISO date
    priority: "low" | "medium" | "high"
}

// вспомогательный метод проверки на валидную дату
function isValidISODate(dateString: unknown): boolean {
  try {
    if (typeof dateString === 'string') {
       const date = new Date(dateString);
        if (isNaN(date.getTime()) && isNaN(date.getDate())) {
            return false; // Date() не смог создать валидную дату (например, "2023-02-30")
        }
        return true;
    } else {
        return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

function isValidTaskMessage(obj: unknown): obj is TaskMessage {
    const options: string[] = ["low", "medium", "high"] as const;
    return (
        typeof obj === 'object' && obj != null &&
        'id' in obj && typeof obj.id === 'string' &&
        'title' in obj && typeof obj.title === 'string' &&
        'createdAt' in obj && isValidISODate(obj.createdAt) &&
        'priority' in obj && typeof obj.priority === 'string' 
        && options.includes(obj.priority)
    )
}


// тестируем
console.log(isValidTaskMessage({
  id: "123",
  title: "Do something",
  createdAt: "2025-07-10T12:00:00Z",
  priority: "high"
})); // true

console.log(isValidTaskMessage({
  id: 123,
  title: "Missing createdAt",
  priority: "low"
})); // false (id не строка, нет createdAt)

console.log(isValidTaskMessage(null)); // false