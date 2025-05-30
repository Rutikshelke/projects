import React from "react";
import { Sidebar } from "flowbite-react";
import { IconSidebar } from "./IconSidebar";
import SidebarContent from "./Sidebaritems";
import NavItems from "./NavItems";
import NavCollapse from "./NavCollapse/NavCollapse";
import SimpleBar from "simplebar-react";

const MobileSidebar = ({
  selectedIconId,
  setSelectedIconId,
  isCollapse,
  setIsCollapse,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen
}) => {
  const selectedContent = SidebarContent.find(
    (data) => data.id === selectedIconId
  );

  const handleMobileItemClick = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <>
      <div>
        <div className="minisidebar-icon border-e border-ld bg-white dark:bg-darkgray fixed start-0 z-[1]">
          <IconSidebar
            selectedIconId={selectedIconId}
            setSelectedIconId={setSelectedIconId}
            isCollapse={isCollapse}
            setIsCollapse={setIsCollapse}
          />
        </div>
        <Sidebar
          className="fixed menu-sidebar pt-8 bg-white dark:bg-darkgray transition-all"
          aria-label="Sidebar with multi-level dropdown example"
        >
          <SimpleBar className="h-[calc(100vh_-_85px)]">
            <Sidebar.Items className="ps-4 pe-4">
              <Sidebar.ItemGroup className="sidebar-nav">
                {selectedContent &&
                  selectedContent.items?.map((item, index) => (
                    <React.Fragment key={index}>
                      <h5 className="text-link font-semibold text-sm caption">
                        {item.heading}
                      </h5>
                      {item.children?.map((child, childIndex) => (
                        <React.Fragment key={child.id || childIndex}>
                          {child.children ? (
                            <NavCollapse item={child} />
                          ) : (
                            <NavItems
                              item={child}
                              onMobileClick={handleMobileItemClick}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}
              </Sidebar.ItemGroup>
            </Sidebar.Items>
          </SimpleBar>
        </Sidebar>
      </div>
    </>
  );
};

export default MobileSidebar;
