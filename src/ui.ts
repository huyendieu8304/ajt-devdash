import {getState, loadDashboardData, filterUsers, selectUser} from "./state.ts";
import {debounce} from "./utils.ts";
import type {Post, User} from "./types.ts";

const debouncedSearch = debounce(
    (term: string) => filterUsers(term),
    300
);

//only register global event listeners once
let isEventsInitialized = false;

//init global event listener
function initializeGlobalEvents(): void {
    if (isEventsInitialized) return;

    // input to search box event
    document.body.addEventListener('input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.id === 'search-box') {
            debouncedSearch(target.value);
        }
    })

    document.body.addEventListener('click', (e: PointerEvent) => {
        const target = e.target as HTMLInputElement;
        // click to init button
        if (target.id === 'btn-init' || target.id === 'btn-retry') {
            loadDashboardData();
        }

        // click to close detail btn
        if (target.id === 'btn-close-detail') {
            selectUser(null);
        }

        // click to user card
        const userCard = target.closest('.user-card');
        if (userCard) {
            const id = Number(userCard.getAttribute('data-id'));
            selectUser(id);
        }
    })

    isEventsInitialized = true;
}

export function renderApp(): void {
    const appElement = document.getElementById('app');
    if (!appElement) return;

    initializeGlobalEvents();

    //snapshot state at render time, help narrowing
    const currentState = getState();

    if (currentState.status === 'idle') {
        appElement.innerHTML = `
                <div class="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                  <button 
                    id="btn-init" 
                    class="px-6 py-3 text-white font-medium bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition"
                    >
                    Khởi tạo DevDash
                  </button>
                </div>
            `;
        return;
    }

    if (currentState.status === 'loading') {
        appElement.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-screen bg-slate-50">
              <div class="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p class="mt-4 text-slate-600 font-medium">Đang tải dữ liệu từ API...</p>
            </div>
        `;
        return;
    }

    if (currentState.status === 'error') {
        appElement.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
              <div class="max-w-md p-6 bg-white border border-red-200 rounded-xl shadow-sm text-center">
                <span class="text-4xl">⚠️</span>
                <h3 class="mt-3 text-lg font-semibold text-slate-900">Lỗi Tải Dữ Liệu</h3>
                <p class="mt-2 text-sm text-red-600">${currentState.message}</p>
                <button id="btn-retry" class="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition">
                  Thử lại
                </button>
              </div>
            </div>
        `;
        return;
    }

    if (currentState.status === 'success') {
        //save the value in search box
        const activeElementId = document.activeElement?.id;
        const currentSearchValue = (document.getElementById('search-box') as HTMLInputElement)?.value || '';

        appElement.innerHTML = `
            <div class="min-h-screen bg-slate-100 font-sans">
              <header class="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 lg:px-20 py-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <h1 class="text-xl font-bold text-slate-800 tracking-tight">DevDash</h1>
                <div class="w-full sm:w-72">
                  <input 
                    type="text" 
                    id="search-box" 
                    placeholder="Tìm tên hoặc email..." 
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50">
                </div>
              </header>
    
              <div class="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
                  <div class="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h2 class="font-semibold text-slate-700 text-sm uppercase tracking-wider">Thành viên (${currentState.filteredUsers.length})</h2>
                  </div>
                  <div class="overflow-y-auto divide-y divide-slate-100 flex-1">
                    ${currentState.filteredUsers.length === 0 ? `
                      <p class="p-8 text-center text-sm text-slate-400">Không tìm thấy kết quả</p>
                    ` : currentState.filteredUsers.map(u => `
                      <div data-id="${u.id}" class="user-card p-4 hover:bg-slate-50 cursor-pointer transition flex flex-col gap-1 ${currentState.selectedUserId === u.id ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : ''}">
                        <div class="font-semibold text-slate-900 text-sm">${u.name}</div>
                        <div class="text-xs text-slate-500">@${u.username}</div>
                        <div class="text-xs text-slate-400 mt-1 flex items-center gap-1">✉️ ${u.email}</div>
                      </div>
                    `).join('')}
                  </div>
                </div>
    
                <div class="lg:col-span-2 flex flex-col h-[calc(100vh-140px)] overflow-y-auto gap-6">
                  ${renderDetailSection(currentState.users, currentState.posts, currentState.selectedUserId)}
                </div>
              </div>
            </div>
        `;

        //reset content in search box
        const searchBox = document.getElementById('search-box') as HTMLInputElement;
        if (searchBox) {
            searchBox.value = currentSearchValue;
            if (activeElementId === 'search-box') {
                searchBox.focus();
            }
        }
    }
}


// render user  detail section
function renderDetailSection(users: User[], posts: Post[], selectedUserId: number | null): string {
    if (!selectedUserId) {
        return `
          <div class="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm flex flex-col items-center justify-center h-full">
            <span class="text-4xl text-slate-300 mb-2">🫣</span>
            <h3 class="text-base font-semibold text-slate-700">Chưa Chọn Thành Viên</h3>
            <p class="text-sm text-slate-400 mt-1 max-w-xs">Vui lòng bấm chọn một thành viên trong danh sách để xem thông tin chi tiết và các bài viết liên quan.</p>
          </div>
        `;
    }

    //todo hinfh nhuw chuwa toi uwu lam
    const user = users.find(u => u.id === selectedUserId);
    const userPosts = posts.filter(p => p.userId === selectedUserId);

    if (!user) return '<p class="text-red-500">Thành viên không tồn tại!</p>';

    return `
        <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h2 class="text-xl font-bold text-slate-900">${user.name}</h2>
            <p class="text-indigo-600 text-sm font-medium">🏢 ${user.company.name}</p>
            <p class="text-xs text-slate-400 italic mt-1">"${user.company.catchPhrase}"</p>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm text-slate-600">
              <div>📞 <span class="font-medium">Phone:</span> ${user.phone}</div>
              <div>🌐 <span class="font-medium">Website:</span> <a href="#" class="text-blue-500 hover:underline">${user.website}</a></div>
            </div>
          </div>
          <button id="btn-close-detail" class="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition">Đóng lại</button>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex-1 flex flex-col overflow-hidden">
          <h3 class="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">✍️ Bài viết nổi bật <span class="text-xs font-normal px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">${userPosts.length} bài</span></h3>
          <div class="overflow-y-auto space-y-4 flex-1 pr-1">
            ${userPosts.map(post => `
              <div class="p-4 bg-slate-50 hover:bg-indigo-50/30 border border-slate-200/60 rounded-lg transition group">
                <h4 class="font-semibold text-slate-800 group-hover:text-indigo-600 transition text-sm mb-1 capitalize">${post.title}</h4>
                <p class="text-xs text-slate-500 leading-relaxed first-letter:capitalize">${post.body}</p>
              </div>
            `).join('')}
          </div>
        </div>
    `;
}
