import React, { useEffect, useState } from "react";
import { Sidebar } from "flowbite-react";
import { IconSidebar } from "./IconSidebar";
import SidebarContent from "./Sidebaritems";
import NavItems from "./NavItems/NavItems";
import NavCollapse from "./NavCollapse/NavCollapse";
import SimpleBar from "simplebar-react";
import { useLocation } from "react-router";
import FullLogo from "../../shared/logo/FullLogo";

const SidebarLayout = () => {
  const [selectedIconId, setSelectedIconId] = useState(1);
  const [isCollapse, setIsCollapse] = useState("full-sidebar");

  const selectedContent = SidebarContent.find(
    (data) => data.id === selectedIconId
  );

  const location = useLocation();
  const pathname = location.pathname;

  function findActiveUrl(narray, targetUrl) {
    for (const item of narray) {
      // Check if the `items` array exists in the top-level object
      if (item.items) {
        // Iterate through each item in the `items` array
        for (const section of item.items) {
          // Check if `children` array exists and search through it
          if (section.children) {
            for (const child of section.children) {
              if (child.url === targetUrl) {
                return item.id; // Return the ID of the first-level object
              }
            }
          }
        }
      }
    }
    return null; // URL not found
  }

  useEffect(() => {
    const result = findActiveUrl(SidebarContent, pathname);
    if (result) {
      setSelectedIconId(result);
    }
  }, [pathname]);

  return (
    <>
      <div className="xl:block hidden">
        <div className="minisidebar-icon border-e border-ld fixed start-0 z-[1]">
          <IconSidebar
            selectedIconId={selectedIconId}
            setSelectedIconId={setSelectedIconId}
            isCollapse={isCollapse}
            setIsCollapse={setIsCollapse}
          />
        </div>
        <Sidebar
          className="fixed menu-sidebar bg-white dark:bg-darkgray rtl:pe-4 rtl:ps-0"
          aria-label="Sidebar with multi-level dropdown example"
        >
          <div className="px-6 py-4 flex items-center sidebarlogo">
            <FullLogo />
          </div>
          <SimpleBar className="h-[calc(100vh_-_85px)] overflow-auto">
            <Sidebar.Items className="pe-4 rtl:pe-0 rtl:ps-4 px-5 mt-2">
              <Sidebar.ItemGroup className="sidebar-nav hide-menu">
                {selectedContent &&
                  selectedContent.items?.map((item, index) => (
                    <div className="caption" key={item.heading}>
                      <React.Fragment key={index}>
                        <h5 className="text-link dark:text-white/70 font-semibold caption font-semibold leading-6 tracking-widest text-xs text-sm pb-2 uppercase">
                          {item.heading}
                        </h5>
                        {item.children?.map((child, childIndex) => (
                          <React.Fragment key={child.id || childIndex}>
                            {child.children ? (
                              <NavCollapse item={child} />
                            ) : (
                              <NavItems item={child} />
                            )}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    </div>
                  ))}
              </Sidebar.ItemGroup>
            </Sidebar.Items>
          </SimpleBar>
        </Sidebar>
      </div>
    </>
  );
};

export default SidebarLayout;
