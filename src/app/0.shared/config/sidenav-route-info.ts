// rounting info
import { NavigationItem } from '../interfaces/navigation-item.interface'
export const sidenavRouteInfo: NavigationItem[] = [
	// dashboard
	{
		type: 'link',
		label: 'Dashboard',
		route: 'main',
		icon: 'dashboard',
	},
	// Leave
	{
		type: 'subheading',
		label: 'Employee Management',
		children: [
			{
				type: 'link',
				label: 'Employee Leave Status',
				route: 'employee-mngmt/employee-leave-status',
				icon: 'receipt_long',
			},
			{
				type: 'link',
				label: 'Employee List',
				route: 'employee-mngmt/manager-list',
				icon: 'list',
			},
			{
				type: 'link',
				label: 'Employee Company Request',
				route: 'employee-mngmt/employee-company-request',
				icon: 'add_business',
			},
			{
				type: 'link',
				label: 'Retired Employee List',
				route: 'employee-mngmt/retired-employee-list',
				icon: 'list',
			},
		]
	},
	{
		type: 'subheading',
		label: 'Corporation',
		children: [
			{
				type: 'link',
				label: 'Holiday Management',
				route: 'company-mngmt/company-holiday-list',
				icon: 'update',
			}
		]
	},
    // document 
    {
		type: 'subheading',
		label: 'Documents',
		children: [
			{
				type: 'link',
				label: 'Important documents',
				route: 'document-mngmt/document-list',
				icon: 'folder_special',
			}
		]
	},
    // contract 
    {
		type: 'subheading',
		label: 'Contract',
		children: [
			{
				type: 'link',
				label: 'Contract management',
				route: 'contract-mngmt/contract-list',
				icon: 'handshake',
			}
		]
	}
];
