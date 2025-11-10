/**
 * Playground 首页（列表页）
 * 用于放置一些想法的 demo 页面
 */
export default function PlaygroundPage() {
  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50/30 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">🎨 Playground</h1>
        <p className="text-gray-600 mb-8">
          这里可以放置一些想法的 demo 页面，用于快速验证和测试。
        </p>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-gray-500 text-sm">在这里添加你的 demo 页面...</p>
        </div>
      </div>
    </div>
  );
}
