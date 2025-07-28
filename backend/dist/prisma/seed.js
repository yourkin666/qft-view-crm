"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 开始初始化数据库种子数据...');
    console.log('📝 创建角色...');
    const adminRole = await prisma.role.upsert({
        where: { name: 'admin' },
        update: {},
        create: {
            name: 'admin',
            description: '超级管理员',
        },
    });
    const agentRole = await prisma.role.upsert({
        where: { name: 'agent' },
        update: {},
        create: {
            name: 'agent',
            description: '经纪人',
        },
    });
    console.log('👤 创建管理员用户...');
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const adminUser = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: adminPassword,
            fullName: '系统管理员',
            phone: '13800138000',
            roleId: adminRole.id,
            isActive: true,
        },
    });
    console.log('👥 创建示例经纪人...');
    const agentPassword = await bcrypt.hash('Agent123!', 10);
    const agentUser = await prisma.user.upsert({
        where: { username: 'agent001' },
        update: {},
        create: {
            username: 'agent001',
            password: agentPassword,
            fullName: '张经纪',
            phone: '13800138001',
            roleId: agentRole.id,
            isActive: true,
        },
    });
    console.log('🏠 创建示例房源...');
    const property1 = await prisma.property.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: '华润城润府',
            address: '深圳市南山区深南大道华润城',
        },
    });
    const property2 = await prisma.property.upsert({
        where: { id: 2 },
        update: {},
        create: {
            name: '前海时代广场',
            address: '深圳市南山区前海路前海时代广场',
        },
    });
    console.log('🔑 创建API密钥...');
    const apiSecretHash = await bcrypt.hash('your-api-secret-key', 10);
    await prisma.apiKey.upsert({
        where: { apiKey: 'qft-api-key-demo' },
        update: {},
        create: {
            channelName: '官网渠道',
            apiKey: 'qft-api-key-demo',
            apiSecretHash,
            isActive: true,
            createdBy: adminUser.id,
        },
    });
    console.log('📋 创建示例带看记录...');
    await prisma.viewingRecord.upsert({
        where: { id: 1 },
        update: {},
        create: {
            tenantName: '李先生',
            primaryPhone: '13900139000',
            primaryWechat: 'li_wechat_001',
            roomId: property1.id,
            businessType: 'focus',
            propertyName: property1.name,
            roomAddress: '深圳市南山区深南大道华润城A座1101',
            preferredViewingTime: '明天下午2-4点',
            viewingStatus: 'pending',
            agentId: agentUser.id,
            agentName: agentUser.fullName,
            agentPhone: agentUser.phone,
            source: 'manual',
            remarks: '客户对地理位置很满意，希望看看具体房间情况',
            requirementsJson: JSON.stringify({
                budget: '8000-10000',
                location: '南山区',
                roomType: '2室1厅',
            }),
            originalQuery: '想在南山区找一个2室1厅的房子，预算8-10k',
            aiSummary: '客户需求：南山区2室1厅，预算8000-10000元',
        },
    });
    console.log('✅ 数据库种子数据初始化完成!');
    console.log('📊 创建的数据:');
    console.log(`   - 角色: ${adminRole.name}, ${agentRole.name}`);
    console.log(`   - 用户: admin (密码: Admin123!), agent001 (密码: Agent123!)`);
    console.log(`   - 房源: ${property1.name}, ${property2.name}`);
    console.log(`   - API密钥: qft-api-key-demo`);
    console.log(`   - 带看记录: 1条示例记录`);
}
main()
    .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map