export function addIsLeafToTree(tree: any[]): any[] {
  function traverse(node: any): any {
    // 创建节点的副本
    const newNode = { ...node, key: node.id }

    // 如果有子节点，递归处理子节点
    if (newNode.children && newNode.children.length > 0) {
      newNode.children = newNode.children.map((child: any) => traverse(child))
    } else {
      // 如果没有子节点，设置 isLeaf 为 true
      newNode.isLeaf = true
    }

    return newNode
  }

  // 遍历树的每个节点
  return tree.map(node => traverse(node))
}
