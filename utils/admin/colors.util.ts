const _randomColors = ['bg-[#1abc9c]', 'bg-[#2ecc71]', 'bg-[#3498db]', 'bg-[#9b59b6]', 'bg-[#f1c40f]', 'bg-[#e67e22]', 'bg-[#e74c3c]', 'bg-[#34495e]']

export default function getRamdomClass() {
  return _randomColors[Math.floor(Math.random() * _randomColors.length)]
}